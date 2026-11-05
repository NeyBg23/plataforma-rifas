/** V18.1 DEMO ONLY. No fetch, no Supabase, no storage, no transactions. */
import {parseDemoParams,newDemoState,placeDemoOrder,releaseDemoOrder,orderStatus,heldNumbers,MAX_SELECTION} from './pedido-demo-domain.mjs';
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);
const selected=new Set();
let lab, page=0, sequence=0;
function feedback(text,error=false){$('feedback').textContent=text;$('feedback').dataset.error=error?'true':'false';}
function status(order){return {'held':'Retenido en esta pestaña','expired':'Vencido','released':'Liberado'}[orderStatus(order,Date.now())];}
function draw(){
 const total=lab.total, start=page*100, end=Math.min(start+100,total), occupied=heldNumbers(lab);
 const grid=$('numbers');grid.replaceChildren();
 for(let n=start;n<end;n++){
   const btn=document.createElement('button');btn.type='button';btn.textContent=String(n).padStart(String(total-1).length,'0');
   btn.setAttribute('aria-pressed',String(selected.has(n)));btn.disabled=occupied.has(n);
   btn.setAttribute('aria-label','Número de ejemplo '+btn.textContent);
   btn.addEventListener('click',()=>{
     if(selected.has(n))selected.delete(n);
     else if(selected.size<MAX_SELECTION)selected.add(n);
     else {feedback('Por ahora puedes escoger máximo cinco números.',true);return;}
     feedback('');draw();
   });grid.append(btn);
 }
 $('pagination').textContent=(page+1)+' / '+Math.ceil(total/100);
 $('previous').disabled=page===0;$('next').disabled=end===total;
 const chosen=[...selected].sort((a,b)=>a-b);
 $('chosen').textContent=chosen.length?chosen.map(n=>String(n).padStart(String(total-1).length,'0')).join(' · '):'Ninguno seleccionado';
 $('chosen-hint').textContent=chosen.length+' de '+MAX_SELECTION+' seleccionados';
 $('amount').textContent=money(chosen.length*lab.price);$('place').disabled=!chosen.length;
 drawOrders();
}
function drawOrders(){
 const list=$('orders');list.replaceChildren();
 for(const order of [...lab.orders].reverse()){
   const box=document.createElement('div');box.className='order';
   const title=document.createElement('b');title.textContent=order.numbers.map(n=>String(n).padStart(String(lab.total-1).length,'0')).join(' · ');
   const desc=document.createElement('small');desc.textContent=status(order);
   box.append(title,desc);
   if(orderStatus(order,Date.now())==='held'){
     const remain=document.createElement('small');remain.textContent='Vence en '+Math.max(0,Math.ceil((order.expiresAt-Date.now())/1000))+' segundos';box.append(remain);
     const release=document.createElement('button');release.type='button';release.textContent='Liberar pedido simulado';
     release.addEventListener('click',()=>{releaseDemoOrder(lab,order.requestId);feedback('Solicitud liberada. Los números vuelven a estar disponibles.');draw();});box.append(release);
   }
   list.append(box);
 }
 if(!lab.orders.length){const p=document.createElement('p');p.textContent='Todavía no hay solicitudes simuladas.';list.append(p);}
 $('order-count').textContent=lab.orders.length+' solicitudes de prueba';
}
$('place').addEventListener('click',()=>{
 const nums=[...selected].sort((a,b)=>a-b);if(!nums.length)return;
 const requestId='DEMO-'+String(++sequence).padStart(4,'0')+'-'+Math.round(Date.now()).toString(36);
 const outcome=placeDemoOrder(lab,nums,requestId);
 if(outcome.outcome==='conflict')feedback('Conflicto: otro pedido de esta pestaña ya ocupa algún número. No hay reserva parcial.',true);
 else {selected.clear();feedback('Pedido de prueba creado. Vence en 120 segundos; no se registra en el servidor.');}
 draw();
});
$('refresh').addEventListener('click',()=>{feedback('Estados de prueba actualizados.');draw();});
$('clear').addEventListener('click',()=>{lab.orders.length=0;selected.clear();feedback('Laboratorio reiniciado. No se modificó información real.');draw();});
$('previous').addEventListener('click',()=>{if(page>0){page--;draw();}});
$('next').addEventListener('click',()=>{if((page+1)*100<lab.total){page++;draw();}});
$('go').addEventListener('click',()=>{const n=Number($('number-search').value);if(!Number.isSafeInteger(n)||n<0||n>=lab.total){feedback('Número fuera de rango.',true);return;}page=Math.floor(n/100);draw();});
// Avance visual del reloj: solo cambia estado local y libera simulaciones vencidas.
setInterval(()=>{if(!lab?.orders.length)return;const now=Date.now();let expired=false;for(const o of lab.orders){if(o.state==='held'&&now>=o.expiresAt){o.state='expired';expired=true;}}if(expired)draw();else drawOrders();},1000);
try{
 const cfg=parseDemoParams(location.search);lab=newDemoState(cfg.total,cfg.price);
 for(const n of cfg.numbers)selected.add(n);
 $('config-label').textContent=cfg.total.toLocaleString('es-CO')+' números · '+money(cfg.price)+' por número · máximo cinco';
 draw();
}catch(err){$('error').textContent='No se pudieron cargar los parámetros de ejemplo: '+err.message;$('error').hidden=false;$('experience').hidden=true;}