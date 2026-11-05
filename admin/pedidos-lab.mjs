// V18.2 — cliente autenticado para PEDIDOS DE LABORATORIO.
// Solo se comunica con Supabase Edge Function tras comprobar usuario y rol.
// No compra, no cobra, no emite boletas ni modifica inventario comercial.
import {normalizeRequest,isAllowedDraft,canUseLab,LAB_TTL_SECONDS} from '../supabase/functions/ets-orders-lab/validation.mjs';
const $=id=>document.getElementById(id);
const cfg=window.ETS_PUBLIC_SUPABASE||{};
const state={client:null,role:null,raffle:null,page:0,selected:new Set(),orders:[],busy:false,ready:false,requestId:null,fingerprint:null};
const money=n=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);
const fmt=(n,total)=>String(n).padStart(String(total-1).length,'0');
function status(text,kind=''){const el=$('status');el.textContent=text;el.dataset.kind=kind;}
function blocked(text){$('loading').hidden=true;$('workspace').hidden=true;$('blocked').hidden=false;$('blocked-message').textContent=text;}
function theme(v){const t=v==='light'?'light':'dark';document.body.dataset.theme=t;$('theme-toggle').textContent=t==='light'?'☾ Tema oscuro':'☀ Tema claro';try{localStorage.setItem('ets-lab-theme',t);}catch{}}
$('theme-toggle').addEventListener('click',()=>theme(document.body.dataset.theme==='dark'?'light':'dark'));
try{theme(localStorage.getItem('ets-lab-theme')||'dark');}catch{theme('dark');}
function heldSet(){const now=Date.now(),held=new Set();for(const o of state.orders){if(o.effective_state==='held_demo'&&Date.parse(o.expires_at)>now)for(const n of o.numbers||[])held.add(n);}return held;}
function updateButtons(){
 $('create-order').disabled=!state.ready||!canUseLab(state.role,'place')||state.selected.size===0||state.busy;
 $('refresh').disabled=state.busy;
 $('expire-orders').disabled=!state.ready||state.busy;
}
function renderNumbers(){
 const r=state.raffle;if(!r)return;
 const grid=$('number-grid');grid.replaceChildren();const start=state.page*100,end=Math.min(start+100,r.total_numbers),held=heldSet();
 for(let n=start;n<end;n++){
  const btn=document.createElement('button');btn.type='button';btn.textContent=fmt(n,r.total_numbers);
  btn.dataset.held=String(held.has(n));btn.disabled=held.has(n)||state.busy;
  btn.setAttribute('aria-pressed',String(state.selected.has(n)));
  btn.setAttribute('aria-label','Número de prueba '+fmt(n,r.total_numbers));
  btn.addEventListener('click',()=>{
   if(state.selected.has(n))state.selected.delete(n);
   else if(state.selected.size<5)state.selected.add(n);
   else {status('Por ahora el máximo es de cinco números.', 'error');return;}
   state.requestId=null;state.fingerprint=null;renderNumbers();
  });grid.append(btn);
 }
 $('pagination').textContent=(state.page+1)+' / '+Math.ceil(r.total_numbers/100);
 $('previous').disabled=state.page===0;$('next').disabled=end>=r.total_numbers;
 const selected=[...state.selected].sort((a,b)=>a-b);
 $('selected-list').textContent=selected.length?selected.map(n=>fmt(n,r.total_numbers)).join(' · '):'Ningún número seleccionado';
 $('selected-count').textContent=selected.length+' de 5';
 $('selected-total').textContent=money(selected.length*r.ticket_price_cop);
 updateButtons();
}
function renderOrders(){
 const container=$('orders');container.replaceChildren();
 const now=Date.now();
 if(!state.orders.length){const p=document.createElement('p');p.className='empty';p.textContent='No hay solicitudes registradas.';container.append(p);return;}
 for(const o of state.orders){
  const div=document.createElement('div');div.className='order';
  const name=document.createElement('div');name.className='order-title';
  const nums=document.createElement('b');nums.textContent=(o.numbers||[]).map(n=>fmt(n,state.raffle.total_numbers)).join(' · ');
  const tag=document.createElement('span');tag.className='order-state';
  const held=o.effective_state==='held_demo'&&Date.parse(o.expires_at)>now;
  tag.textContent=held?'RETENIDO':o.effective_state==='released_demo'?'LIBERADO':'VENCIDO';
  name.append(nums,tag);div.append(name);
  const when=document.createElement('small');
  when.textContent=held?'Vence en '+Math.max(0,Math.ceil((Date.parse(o.expires_at)-now)/1000))+' segundos':'Solicitud de laboratorio';
  div.append(when);
  if(held&&canUseLab(state.role,'release')){
   const btn=document.createElement('button');btn.type='button';btn.textContent='Liberar números';
   btn.disabled=state.busy;btn.addEventListener('click',()=>void release(o.id));div.append(btn);
  }
  container.append(div);
 }
}
async function request(action,extra={}){
 if(!state.client||!state.raffle)throw Error('Debes iniciar sesión.');
 const payload=normalizeRequest({action,raffle_id:state.raffle.id,...extra});
 const {data:{session},error}=await state.client.auth.getSession();
 if(error||!session?.access_token)throw Error('Sesión vencida. Inicia sesión nuevamente.');
 const url=new URL('/functions/v1/ets-orders-lab',cfg.url);
 const response=await fetch(url,{
  method:'POST',headers:{'content-type':'application/json','apikey':cfg.publishableKey,'authorization':'Bearer '+session.access_token},
  body:JSON.stringify(payload),cache:'no-store'
 });
 let result;
 try{result=await response.json();}catch{throw Error('El servicio no devolvió una respuesta válida.');}
 if(response.status===409&&result?.outcome==='conflict')return result;
 if(!response.ok||!result?.ok)throw Error(typeof result?.error==='string'?result.error:'Servicio no disponible.');
 if(result.mode!=='laboratorio')throw Error('Respuesta no verificada.');
 return result;
}
async function refresh(){
 if(state.busy)return;state.busy=true;updateButtons();
 try{
  const response=await request('list');
  if(!Array.isArray(response.orders))throw Error('Listado inválido.');
  state.orders=response.orders;state.ready=true;
  const held=heldSet();for(const n of state.selected)if(held.has(n))state.selected.delete(n);
  renderOrders();renderNumbers();status('Conectado a Supabase: solicitudes de laboratorio, no ventas.');
 }catch(err){state.ready=false;state.orders=[];renderOrders();renderNumbers();status(err.message||'Servicio no disponible.','error');}
 finally{state.busy=false;updateButtons();}
}
async function createOrder(){
 if(state.busy||!state.ready||!state.selected.size||!canUseLab(state.role,'place'))return;
 const nums=[...state.selected].sort((a,b)=>a-b),signature=nums.join(',');
 if(state.fingerprint!==signature||!state.requestId){state.requestId=crypto.randomUUID();state.fingerprint=signature;}
 state.busy=true;updateButtons();status('Registrando selección en el laboratorio…');
 let message='';
 try{
  const response=await request('place',{request_id:state.requestId,numbers:nums});
  if(!['created','replay','conflict'].includes(response.outcome))throw Error('Respuesta no reconocida.');
  if(response.outcome==='conflict'){message='Conflicto: otro pedido de prueba ocupa uno de esos números. No hubo asignación parcial.';state.requestId=null;state.fingerprint=null;}
  else{message=response.outcome==='replay'?'Reintento reconocido: no se creó un pedido duplicado.':'Pedido de prueba registrado durante '+LAB_TTL_SECONDS+' segundos.';state.selected.clear();state.requestId=null;state.fingerprint=null;}
 }catch(err){message=err.message||'No se confirmó el pedido. Puedes reintentar la misma selección.';}
 finally{state.busy=false;updateButtons();}
 await refresh();status(message, message.includes('Conflicto')?'error':'');
}
async function release(orderId){
 if(!canUseLab(state.role,'release')||state.busy)return;
 state.busy=true;updateButtons();
 try{const response=await request('release',{order_id:orderId});status(response.released?'Números liberados en laboratorio.':'Este pedido ya no estaba retenido.');}
 catch(err){status(err.message||'No fue posible liberar.', 'error');}
 finally{state.busy=false;updateButtons();}
 await refresh();
}
async function expireOrders(){
 if(!canUseLab(state.role,'expire')||state.busy)return;
 state.busy=true;updateButtons();
 try{const response=await request('expire');status('Pedidos vencidos procesados: '+response.expired+'.');}
 catch(err){status(err.message||'No se pudieron procesar los vencimientos.','error');}
 finally{state.busy=false;updateButtons();}
 await refresh();
}
$('previous').addEventListener('click',()=>{if(state.page>0){state.page--;renderNumbers();}});
$('next').addEventListener('click',()=>{if(state.raffle&&(state.page+1)*100<state.raffle.total_numbers){state.page++;renderNumbers();}});
$('refresh').addEventListener('click',()=>void refresh());
$('create-order').addEventListener('click',()=>void createOrder());
$('expire-orders').addEventListener('click',()=>void expireOrders());
setInterval(()=>{if(state.raffle&&!state.busy){renderOrders();renderNumbers();}},5000);
async function start(){
 const raffleId=new URLSearchParams(location.search).get('rifa');
 if(typeof raffleId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raffleId))return blocked('Abre el laboratorio desde el administrador.');
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(cfg.url||'')||!/^sb_publishable_[a-z0-9_-]{12,}$/i.test(cfg.publishableKey||''))return blocked('Configuración incompleta de Supabase.');
 if(!window.supabase?.createClient)return blocked('No fue posible cargar la autenticación.');
 const client=window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
 const {data:{user},error:userError}=await client.auth.getUser();
 if(userError||!user)return blocked('Inicia sesión en el administrador, en este mismo dominio.');
 const staff=await client.from('ets_staff_members').select('role,enabled').eq('user_id',user.id).maybeSingle();
 if(staff.error||!staff.data?.enabled||!['admin','operator','auditor'].includes(staff.data.role))return blocked('Cuenta sin autorización de personal.');
 const {data:raffle,error}=await client.from('ets_raffles').select('id,title,total_numbers,ticket_price_cop,state,authorization_verified').eq('id',raffleId).maybeSingle();
 if(error||!isAllowedDraft(raffle))return blocked('El laboratorio solo admite rifas en borrador que no estén autorizadas para ventas.');
 state.client=client;state.role=staff.data.role;state.raffle=raffle;
 $('expire-orders').hidden=staff.data.role!=='admin';
 const input=new URLSearchParams(location.search).get('numbers');
 if(input&&/^\d+(,\d+){0,4}$/.test(input))for(const text of input.split(',')){const n=Number(text);if(Number.isInteger(n)&&n>=0&&n<raffle.total_numbers)state.selected.add(n);}
 $('raffle-title').textContent=raffle.title;
 $('raffle-subtitle').textContent=raffle.total_numbers.toLocaleString('es-CO')+' números · '+money(raffle.ticket_price_cop)+' por número · modo prueba';
 $('loading').hidden=true;$('workspace').hidden=false;
 renderNumbers();await refresh();
}
void start().catch(()=>blocked('No fue posible iniciar el laboratorio. Vuelve al administrador.'));
