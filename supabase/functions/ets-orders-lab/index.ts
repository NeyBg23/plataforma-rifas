// El toque de la suerte — V18.2. API de LABORATORIO, no de comercio.
// La base de datos del laboratorio está en esquema privado: ets_order_lab.
// No trata datos de clientes, ni procesa pagos, ni toca ets_number_allocations.
import {createClient} from 'npm:@supabase/supabase-js@2.118.0';
import postgres from 'npm:postgres@3.4.7';
import {normalizeRequest,ValidationError,canUseLab,isAllowedDraft,numbersInRange,MAX_BODY_BYTES,LAB_TTL_SECONDS} from './validation.mjs';

const allowedOrigins=new Set([
 'https://el-toque-de-la-suerte.vercel.app',
 'https://el-toque-de-la-suerte-haimpress.vercel.app',
 'https://el-toque-de-la-suerte-git-main-haimpress.vercel.app'
]);
const url=Deno.env.get('SUPABASE_URL')||'';
const anonKey=Deno.env.get('SUPABASE_ANON_KEY')||'';
const dbUrl=Deno.env.get('SUPABASE_DB_URL')||'';
const db=dbUrl?postgres(dbUrl,{prepare:false,max:1,connect_timeout:6,idle_timeout:20}):null;

function respond(payload,status,origin){
 return new Response(JSON.stringify(payload),{
  status,headers:{
   'content-type':'application/json; charset=utf-8',
   'cache-control':'no-store',
   'x-content-type-options':'nosniff',
   'vary':'Origin',
   ...(origin?{'access-control-allow-origin':origin}:{})
  }
 });
}
async function readLimitedJson(req){
 const reader=req.body?.getReader();
 if(!reader)throw new ValidationError('Falta la solicitud.');
 const chunks=[];let total=0;
 while(true){
  const {done,value}=await reader.read();
  if(done)break;
  total+=value.byteLength;
  if(total>MAX_BODY_BYTES){await reader.cancel();throw new ValidationError('Solicitud demasiado grande.');}
  chunks.push(value);
 }
 const buf=new Uint8Array(total);let offset=0;
 for(const chunk of chunks){buf.set(chunk,offset);offset+=chunk.byteLength;}
 try {return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(buf));}
 catch {throw new ValidationError('Formato JSON inválido.');}
}

Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'';
 if(!allowedOrigins.has(origin))return respond({error:'Origen no admitido'},403,null);
 if(req.method==='OPTIONS'){
  return new Response(null,{status:204,headers:{
   'access-control-allow-origin':origin,
   'access-control-allow-methods':'POST, OPTIONS',
   'access-control-allow-headers':'authorization, apikey, content-type, x-client-info',
   'access-control-max-age':'600',
   'vary':'Origin'
  }});
 }
 if(req.method!=='POST')return respond({error:'Método no permitido'},405,origin);
 if(!db||!url||!anonKey)return respond({error:'El laboratorio todavía no está configurado'},503,origin);
 const authorization=req.headers.get('authorization')||'';
 const token=/^Bearer\s+([A-Za-z0-9._-]+)$/.exec(authorization)?.[1];
 if(!token)return respond({error:'Inicia sesión en el administrador'},401,origin);
 try{
  const input=normalizeRequest(await readLimitedJson(req));
  // Verificación del usuario con Auth en CADA llamada (no confiar en datos del cliente).
  const auth=createClient(url,anonKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  const result=await auth.auth.getUser(token);
  const user=result.data?.user;
  if(result.error||!user||user.is_anonymous)return respond({error:'Sesión no válida'},401,origin);

  // Rol vigente leído en PostgreSQL. No depende de user_metadata editable.
  const roles=await db`select role,enabled from public.ets_staff_members
                      where user_id=${user.id}::uuid limit 1`;
  const staff=roles[0];
  if(!staff?.enabled||!canUseLab(staff.role,input.action))return respond({error:'Permiso insuficiente'},403,origin);
  const raffles=await db`select id,title,state,authorization_verified,total_numbers
                          from public.ets_raffles where id=${input.raffle_id}::uuid limit 1`;
  const raffle=raffles[0];
  if(!isAllowedDraft(raffle))return respond({error:'Solo se admiten sorteos en borrador sin autorización comercial'},409,origin);

  if(input.action==='list'){
   const rows=await db`select id,request_id,numbers,state,
     case when state='held_demo' and expires_at<=clock_timestamp() then 'expired_demo' else state end as effective_state,
     expires_at,created_at from ets_order_lab.orders
     where raffle_id=${input.raffle_id}::uuid order by created_at desc limit 40`;
   return respond({ok:true,mode:'laboratorio',orders:rows},200,origin);
  }
  if(input.action==='place'){
   if(!numbersInRange(input.numbers,raffle.total_numbers))return respond({error:'Número fuera del rango del sorteo'},422,origin);
   const response=await db`select outcome,demo_order_id,expires_at
     from ets_order_lab.place_demo_order(
      ${input.raffle_id}::uuid,
      ${input.request_id}::uuid,
      ${db.array(input.numbers,'int4')},
      ${LAB_TTL_SECONDS}
     )`;
   const row=response[0];
   if(!row||!['created','replay','conflict'].includes(row.outcome))return respond({error:'Resultado de laboratorio no disponible'},500,origin);
   return respond({ok:true,mode:'laboratorio',...row},row.outcome==='conflict'?409:200,origin);
  }
  if(input.action==='release'){
   // Restringir la liberación a un pedido de la MISMA rifa.
   const match=await db`select id from ets_order_lab.orders where id=${input.order_id}::uuid
                          and raffle_id=${input.raffle_id}::uuid limit 1`;
   if(!match.length)return respond({error:'Pedido de laboratorio no encontrado'},404,origin);
   const released=await db`select ets_order_lab.release_demo_order(${input.order_id}::uuid) as released`;
   return respond({ok:true,mode:'laboratorio',released:released[0]?.released===true},200,origin);
  }
  if(input.action==='expire'){
   // Solo administradores: limpieza manual del laboratorio, no de inventario real.
   const expired=await db`select ets_order_lab.expire_demo_orders(100) as expired`;
   return respond({ok:true,mode:'laboratorio',expired:expired[0]?.expired??0},200,origin);
  }
  return respond({error:'Operación no disponible'},400,origin);
 }catch(err){
  if(err instanceof ValidationError)return respond({error:err.message},422,origin);
  // No devolver nombres de tablas, parámetros, secretos ni SQL al navegador.
  console.error('ets-orders-lab request failed',err instanceof Error?err.name:'unknown');
  return respond({error:'No fue posible completar la prueba. Intenta nuevamente.'},500,origin);
 }
});
