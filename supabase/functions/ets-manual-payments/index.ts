import {createClient} from 'npm:@supabase/supabase-js@2.118.0';
import postgres from 'npm:postgres@3.4.7';
import {normalizeInput,InputError,STAFF_ACTIONS,MAX_BODY_BYTES} from './validation.mjs';

const origins = new Set([
  'https://el-toque-de-la-suerte.vercel.app',
  'https://el-toque-de-la-suerte-haimpress.vercel.app',
  'https://el-toque-de-la-suerte-git-main-haimpress.vercel.app'
]);
const url = Deno.env.get('SUPABASE_URL') || '';
const publicKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const databaseUrl = Deno.env.get('SUPABASE_DB_URL') || '';
const db = databaseUrl ? postgres(databaseUrl,{prepare:false,max:1,connect_timeout:8,idle_timeout:20}) : null;
const storage = createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}}).storage.from('ets-payment-qr');
const auth = createClient(url,publicKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
function respond(body,status,origin) {
  return new Response(JSON.stringify(body),{status,headers:{
    'content-type':'application/json; charset=utf-8','cache-control':'no-store',
    'x-content-type-options':'nosniff','vary':'Origin',
    ...(origin ? {'access-control-allow-origin':origin} : {})
  }});
}
async function readJson(req) {
  const reader = req.body?.getReader();
  if (!reader) throw new InputError('Falta la solicitud.');
  const chunks = [];
  let total = 0;
  while (true) {
    const {done,value} = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) { await reader.cancel(); throw new InputError('Solicitud demasiado grande.'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk,offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)); }
  catch { throw new InputError('Formato inválido.'); }
}
async function digest(value) {
  const bytes = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2,'0')).join('');
}
async function paymentDetails(details) {
  if (!details) return null;
  const {qr_path,...publicDetails} = details;
  let qr_url = null;
  if (qr_path) {
    const {data,error} = await storage.createSignedUrl(qr_path,300);
    if (error) throw new Error('QR unavailable');
    qr_url = data.signedUrl;
  }
  return {...publicDetails,qr_url};
}
async function orderStatus(input,hash) {
  return await db.begin(async tx => {
    const [order] = await tx`select id,raffle_id,is_test from ets_manual.orders
      where id=${input.order_id}::uuid and raffle_id=${input.raffle_id}::uuid and access_hash=${hash}`;
    if (!order || order.is_test !== input.is_test) throw new InputError('Pedido no encontrado.');
    await tx`select ets_manual.expire_orders(${input.raffle_id}::uuid,${input.is_test})`;
    const [row] = await tx`select id,numbers,amount_cop,state,is_test,expires_at,
      payment_reference,review_note,payment_details from ets_manual.orders where id=${input.order_id}::uuid`;
    return row;
  });
}

Deno.serve(async req => {
  const origin = req.headers.get('origin') || '';
  if (!origins.has(origin)) return respond({error:'Origen no admitido'},403,null);
  if (req.method === 'OPTIONS') return new Response(null,{status:204,headers:{
    'access-control-allow-origin':origin,'access-control-allow-methods':'POST, OPTIONS',
    'access-control-allow-headers':'authorization, apikey, content-type, x-client-info','vary':'Origin'
  }});
  if (req.method !== 'POST') return respond({error:'Método no admitido'},405,origin);
  if (!db) return respond({error:'El servicio de pedidos no está disponible.'},503,origin);
  try {
    const input = normalizeInput(await readJson(req));
    let user = null;
    let role = null;
    if (STAFF_ACTIONS.has(input.action) || input.is_test) {
      const token = /^Bearer\s+([A-Za-z0-9._-]+)$/.exec(req.headers.get('authorization') || '')?.[1];
      if (!token) return respond({error:'Inicia sesión en el administrador.'},401,origin);
      const result = await auth.auth.getUser(token);
      user = result.data?.user;
      if (result.error || !user || user.is_anonymous) return respond({error:'La sesión venció. Vuelve a iniciar sesión.'},401,origin);
      const [staff] = await db`select role,enabled from public.ets_staff_members where user_id=${user.id}::uuid`;
      if (!staff?.enabled || !['admin','operator','auditor'].includes(staff.role)) return respond({error:'Permiso insuficiente.'},403,origin);
      role = staff.role;
      if (['save_settings','qr_upload','review','place','report'].includes(input.action) && role === 'auditor') {
        return respond({error:'Tu cuenta tiene acceso de consulta.'},403,origin);
      }
    }
    if (input.action === 'publication_status') {
      const [row] = await db`select ets_internal.raffle_listing_status(${input.raffle_id}::uuid) as status`;
      return respond({ok:true,status:row.status},200,origin);
    }
    if (input.action === 'publish_listing') {
      if (role !== 'admin') return respond({error:'La publicación requiere una cuenta de administrador.'},403,origin);
      const [row] = await db`select ets_internal.publish_raffle_listing(${input.raffle_id}::uuid,${user.id}::uuid) as status`;
      return respond({ok:true,status:row.status},200,origin);
    }
    const [raffle] = await db`select id,title,state,authorization_verified,draw_at,ticket_price_cop,total_numbers
      from public.ets_raffles where id=${input.raffle_id}::uuid`;
    if (!raffle) return respond({error:'Sorteo no encontrado.'},404,origin);
    const publicRaffle = {id:raffle.id,title:raffle.title,total_numbers:raffle.total_numbers,ticket_price_cop:raffle.ticket_price_cop};

    if (input.action === 'qr_upload') {
      const path = input.raffle_id + '/' + crypto.randomUUID() + '.' + input.extension;
      const {data,error} = await storage.createSignedUploadUrl(path);
      if (error) throw new Error('QR upload unavailable');
      return respond({ok:true,path,token:data.token},200,origin);
    }
    if (input.action === 'save_settings') {
      if (input.qr_path) {
        const found = await db`select 1 from storage.objects where bucket_id='ets-payment-qr' and name=${input.qr_path}`;
        if (!found.length) throw new InputError('La imagen QR no terminó de subir. Intenta otra vez.');
      }
      await db`insert into ets_manual.settings(raffle_id,recipient,institution,payment_key,instructions,qr_path,enabled,updated_by)
        values(${input.raffle_id}::uuid,${input.recipient},${input.institution},${input.payment_key},
          ${input.instructions},${input.qr_path},${input.enabled},${user.id}::uuid)
        on conflict(raffle_id) do update set recipient=excluded.recipient,institution=excluded.institution,
          payment_key=excluded.payment_key,instructions=excluded.instructions,qr_path=excluded.qr_path,
          enabled=excluded.enabled,updated_by=excluded.updated_by,updated_at=clock_timestamp()`;
      return respond({ok:true},200,origin);
    }
    if (input.action === 'admin_get') {
      const [settings] = await db`select recipient,institution,payment_key,instructions,qr_path,enabled
        from ets_manual.settings where raffle_id=${input.raffle_id}::uuid`;
      return respond({ok:true,raffle,role,settings:settings || null,
        payment:await paymentDetails(settings)},200,origin);
    }
    if (input.action === 'list_orders') {
      const orders = await db.begin(async tx => {
        await tx`select ets_manual.expire_orders(${input.raffle_id}::uuid,${input.is_test})`;
        return await tx`select id,numbers,customer_name,customer_contact,amount_cop,state,
          is_test,expires_at,payment_reference,review_note,created_at from ets_manual.orders
          where raffle_id=${input.raffle_id}::uuid and is_test=${input.is_test}
          order by created_at desc,id desc limit 51 offset ${input.page * 50}`;
      });
      return respond({ok:true,orders:orders.slice(0,50),has_more:orders.length > 50},200,origin);
    }
    if (input.action === 'review') {
      const match = await db`select 1 from ets_manual.orders where id=${input.order_id}::uuid
        and raffle_id=${input.raffle_id}::uuid and is_test=${input.is_test}`;
      if (!match.length) return respond({error:'Pedido no encontrado en esta vista.'},404,origin);
      const [row] = await db`select ets_manual.review_payment(${input.raffle_id}::uuid,
        ${input.order_id}::uuid,${user.id}::uuid,${input.decision},${input.note}) as state`;
      return respond({ok:true,state:row.state},200,origin);
    }
    if (input.action === 'quote') {
      if (!input.is_test && (raffle.state !== 'published' || !raffle.authorization_verified || !raffle.draw_at || new Date(raffle.draw_at).getTime() <= Date.now())) {
        return respond({error:'Este sorteo todavía no está habilitado para pedidos públicos.'},409,origin);
      }
      const [settings] = await db`select recipient,institution,payment_key,instructions,qr_path,enabled
        from ets_manual.settings where raffle_id=${input.raffle_id}::uuid`;
      if (!settings?.enabled) return respond({error:'El administrador debe guardar y activar el QR o la llave de este sorteo.'},409,origin);
      const unavailable = await db.begin(async tx => {
        await tx`select ets_manual.expire_orders(${input.raffle_id}::uuid,${input.is_test})`;
        const start = input.page * 100;
        return await tx`select number from ets_manual.slots where raffle_id=${input.raffle_id}::uuid
          and is_test=${input.is_test} and number >= ${start} and number < ${start + 100}
          union select number from public.ets_number_allocations where not ${input.is_test}
            and raffle_id=${input.raffle_id}::uuid and number >= ${start} and number < ${start + 100}`;
      });
      return respond({ok:true,raffle:publicRaffle,
        payment:await paymentDetails(settings),unavailable:unavailable.map(r => r.number),is_test:input.is_test},200,origin);
    }
    const hash = await digest(input.access_token);
    if (input.action === 'place') {
      const source = await digest(serviceKey + '|' + (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim());
      const [row] = await db`select ets_manual.place_order(${input.raffle_id}::uuid,${input.order_id}::uuid,
        ${hash},${input.numbers}::integer[],${input.customer_name},${input.customer_contact},${input.is_test},${user?.id || null}::uuid,${source}) as result`;
      if (row.result.outcome === 'conflict') return respond({error:'Uno de esos números acaba de ser elegido. Actualiza la selección.',outcome:'conflict'},409,origin);
    }
    if (input.action === 'report') {
      // Verificar también el modo antes de cambiar el estado de un pedido.
      await orderStatus(input,hash);
      await db`select ets_manual.report_payment(${input.raffle_id}::uuid,${input.order_id}::uuid,${hash},${input.payment_reference})`;
    }
    const order = await orderStatus(input,hash);
    return respond({ok:true,raffle:publicRaffle,order:{...order,amount_cop:Number(order.amount_cop),payment_details:await paymentDetails(order.payment_details)}},200,origin);
  } catch (error) {
    if (error instanceof InputError) return respond({error:error.message},422,origin);
    if (error?.code === '23505') return respond({error:'La referencia o los números ya están registrados en otro pedido.'},409,origin);
    if (error?.code === 'PT429') return respond({error:'Hay varios pedidos pendientes desde este acceso. Revisa el anterior antes de crear otro.'},429,origin);
    if (error?.code === '42501') return respond({error:'El sorteo o la cuenta no permiten esta operación.'},403,origin);
    if (error?.code === '22023') return respond({error:'El pedido cambió o venció. Actualiza la página y revisa su estado.'},409,origin);
    console.error('Manual payment failed',{code:/^[A-Z0-9]{5}$/.test(error?.code || '') ? error.code : 'unknown'});
    return respond({error:'No se pudo completar la operación. Puedes reintentar.'},500,origin);
  }
});
