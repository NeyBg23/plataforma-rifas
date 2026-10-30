/** El toque de la suerte — V12.1. Consola de lectura interna.
 * Nunca opera pedidos, ni reservas, ni pagos.
 * El permiso se comprueba en Supabase Auth + RLS, NO en el navegador.
 */
const qs = id => document.getElementById(id);
const config = window.ETS_PUBLIC_SUPABASE || {};
const btn = qs('themeBtn');
const themeKey = 'el-toque-v6-tema';
const format = n => new Intl.NumberFormat('es-CO').format(Number(n));
const labels = {draft:'Borrador',in_review:'En revisión',awaiting_authorization:'Pendiente de autorización',published:'Publicada',closed:'Cerrada',cancelled:'Cancelada'};
const auditLabels = {INSERT:'Rifa creada',UPDATE:'Rifa actualizada',DELETE:'Rifa eliminada',PRIZE_INSERT:'Ficha creada',PRIZE_UPDATE:'Ficha actualizada',PHOTO_INSERT:'Foto agregada',PHOTO_DELETE:'Foto retirada',PHOTO_UPDATE:'Foto modificada'};
let client;
let authorized = false;
let busy = false;

function theme(next) {
 const mode=next==='light'?'light':'dark';
 document.body.dataset.theme=mode;
 btn.textContent=mode==='light'?'☾ Tema oscuro':'☀ Tema claro';
 try { localStorage.setItem(themeKey,mode); } catch {}
}
let initial='dark';
try { initial=localStorage.getItem(themeKey)||'dark'; } catch {}
theme(initial);
btn.addEventListener('click',()=>theme(document.body.dataset.theme==='dark'?'light':'dark'));

function status(message,kind='') {
 const el=qs('sessionStatus');el.textContent=message;
 el.dataset.kind=kind;
}
function err(message) {
 const el=qs('requestError');el.textContent=message;el.hidden=!message;
}
function renderText(parent,tag,text,className='') {
 const el=document.createElement(tag);el.textContent=String(text);
 if(className)el.className=className;
 parent.append(el);return el;
}
function renderRaffles(rows){
 const target=qs('raffleRows');target.replaceChildren();
 if(!rows.length){renderText(target,'p','No hay rifas para mostrar.','empty-line');return;}
 for(const r of rows){
  const item=document.createElement('div');item.className='data-row';
  const group=document.createElement('div');renderText(group,'strong',r.title||'Sin nombre');renderText(group,'small',`Configuración: ${format(r.total_numbers||0)} números`);
  item.append(group);renderText(item,'span',labels[r.state]||r.state||'Sin estado','state-tag');target.append(item);
 }
}
function renderAudit(rows) {
 const target=qs('auditRows');target.replaceChildren();
 if(!rows.length){renderText(target,'p','No hay eventos registrados.','empty-line');return;}
 for(const e of rows){
  const item=document.createElement('div');item.className='data-row';
  const group=document.createElement('div');renderText(group,'strong',auditLabels[e.operation]||'Evento');
  let at='Fecha no disponible';
  if(e.created_at) {const d=new Date(e.created_at);if(!Number.isNaN(d.valueOf()))at=d.toLocaleString('es-CO',{dateStyle:'medium',timeStyle:'short'});}
  renderText(group,'small',at);item.append(group);target.append(item);
 }
}
async function updateReadOnly() {
 if(!authorized||busy)return;
 busy=true;qs('refreshData').disabled=true;err('');status('Actualizando datos…');
 try {
  const [raffles,allocations,audit]=await Promise.all([
    client.from('ets_raffles').select('id,title,state,total_numbers,created_at').order('created_at',{ascending:false}).limit(100),
    client.from('ets_number_allocations').select('number',{head:true,count:'exact'}),
    client.from('ets_raffle_audit').select('id,operation,created_at,raffle_id',{count:'exact'}).order('created_at',{ascending:false}).limit(12)
  ]);
  for(const response of [raffles,allocations,audit])if(response.error)throw new Error('Consulta no autorizada o no disponible');
  qs('rafflesCount').textContent=format(raffles.data.length);
  qs('allocationsCount').textContent=format(allocations.count??0);
  qs('auditCount').textContent=format(audit.count??audit.data.length);
  renderRaffles(raffles.data||[]);renderAudit(audit.data||[]);
  status('Lectura autorizada','ok');
 }catch(e){
  err('No fue posible consultar la base con esta sesión. Verifica el permiso y vuelve a intentar.');status('Consulta no disponible','error');
  for(const id of ['rafflesCount','allocationsCount','auditCount'])qs(id).textContent='—';
  qs('raffleRows').replaceChildren();qs('auditRows').replaceChildren();
 }finally{busy=false;qs('refreshData').disabled=false;}
}
async function start(){
 qs('privateDashboard').hidden=true;
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(String(config.url||''))||!/^sb_publishable_[a-z0-9_-]{12,}$/i.test(String(config.publishableKey||''))){status('Configuración incompleta','error');return;}
 try {
  if(!window.supabase?.createClient){
    await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.js';s.onload=res;s.onerror=rej;document.head.append(s);});
  }
  client=window.supabase.createClient(config.url,config.publishableKey,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:false}});
  const result=await client.auth.getUser();
  if(result.error||!result.data?.user){status('Inicia sesión en el administrador','locked');return;}
  const user=result.data.user;
  const staff=await client.from('ets_staff_members').select('role,enabled').eq('user_id',user.id).maybeSingle();
  if(staff.error||!staff.data?.enabled||!['admin','operator','auditor'].includes(staff.data.role)){
   status('Cuenta sin permiso de personal','locked');return;
  }
  authorized=true;
  qs('privateDashboard').hidden=false;
  qs('accessGate').hidden=true;
  qs('account').textContent=`Acceso de ${staff.data.role==='admin'?'administrador':staff.data.role==='operator'?'operador':'auditor'}`;
  await updateReadOnly();
 }catch(e){status('No se pudo verificar el acceso','error');err('Comprueba tu conexión o accede al administrador y vuelve a abrir esta página.');}
}
qs('refreshData').addEventListener('click',updateReadOnly);
for(const a of document.querySelectorAll('.side > a'))a.addEventListener('click',()=>{
 document.querySelectorAll('.side > a').forEach(x=>x.classList.remove('active'));a.classList.add('active');
});
start();