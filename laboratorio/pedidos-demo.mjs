/** Laboratorio en memoria. Todos los pedidos y pagos son simulados. */
import {parseDemoParams,newDemoState,placeDemoOrder,releaseDemoOrder,orderStatus,heldNumbers,MAX_SELECTION} from './pedido-demo-domain.mjs';
import { createSimulatedPayment, reconcileSimulatedPayment } from './pago-simulado-domain.mjs';

const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);
const selected=new Set();
const payments = new Map();
const demoRaffleId = '00000000-0000-4000-8000-000000000001';
const paymentLabels = {
  PENDING: 'Pendiente de simular',
  APPROVED: 'Aprobado en simulación',
  DECLINED: 'Rechazado en simulación',
  REQUIRES_REVIEW: 'Aprobación tardía · Requiere revisión',
};
let lab, page=0, activePaymentOrder=null;

function feedback(text,error=false){$('feedback').textContent=text;$('feedback').dataset.error=error?'true':'false';}
function status(order){return {'held':'Retenido en esta pestaña','expired':'Vencido','released':'Liberado'}[orderStatus(order,Date.now())];}

function orderNumbers(order) {
  return order.numbers.map(number => String(number).padStart(String(lab.total - 1).length, '0')).join(' · ');
}

function paymentOrderSnapshot(order) {
  return {
    id: order.requestId,
    request_id: order.requestId,
    raffle_id: demoRaffleId,
    numbers: order.numbers,
    state: order.state + '_demo',
    expires_at: order.expiresAt,
  };
}

function renderPayment() {
  const payment = payments.get(activePaymentOrder?.requestId);
  $('payment-details').hidden = !payment;
  $('payment-instructions').hidden = Boolean(payment);
  if (!payment) return;

  $('payment-numbers').textContent = orderNumbers(activePaymentOrder);
  $('payment-reference').textContent = payment.reference;
  $('payment-amount').textContent = money(payment.amountInCents / 100);
  const result = $('payment-result');
  result.textContent = paymentLabels[payment.status];
  result.dataset.result = payment.status;

  const pending = payment.status === 'PENDING';
  $('payment-approve').hidden = !pending;
  $('payment-decline').hidden = !pending;
  $('payment-repeat').hidden = pending;
}

function openPayment(order) {
  try {
    if (!payments.has(order.requestId)) {
      const raffle = {
        id: demoRaffleId,
        state: 'draft',
        authorization_verified: false,
        total_numbers: lab.total,
        ticket_price_cop: lab.price,
      };
      payments.set(order.requestId, createSimulatedPayment(paymentOrderSnapshot(order), raffle));
    }
  } catch (error) {
    feedback(error.message, true);
    draw();
    return;
  }

  activePaymentOrder = order;
  $('payment-feedback').textContent = '';
  renderPayment();
  $('payment-heading').focus();
}

function simulateResult(status) {
  const order = activePaymentOrder;
  const payment = payments.get(order?.requestId);
  if (!payment) return;

  const event = {
    event: 'transaction.updated',
    environment: payment.environment,
    data: {
      transaction: {
        id: 'SIM-' + order.requestId,
        reference: payment.reference,
        amount_in_cents: payment.amountInCents,
        currency: payment.currency,
        status: status ?? payment.transactionStatus,
      },
    },
  };
  const result = reconcileSimulatedPayment(payment, paymentOrderSnapshot(order), event);
  payments.set(order.requestId, result);
  renderPayment();
  $('payment-feedback').textContent = result === payment
    ? 'Notificación repetida. Se conservó el mismo resultado.'
    : paymentLabels[result.status] + '. Resultado guardado en esta pestaña.';
  $('payment-repeat').focus();
}

function updateCountdown(label, expiresAt, now) {
  label.textContent = 'Vence en ' + Math.max(0, Math.ceil((expiresAt - now) / 1000)) + ' segundos';
}

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
 const now = Date.now();
 for(const order of [...lab.orders].reverse()){
   const box=document.createElement('div');box.className='order';
   const title=document.createElement('b');title.textContent=orderNumbers(order);
   const desc=document.createElement('small');desc.textContent=status(order);
   box.append(title,desc);
   const held = orderStatus(order, now) === 'held';
   if(held){
     const remain = document.createElement('small');
     remain.dataset.expiresAt = String(order.expiresAt);
     updateCountdown(remain, order.expiresAt, now);
     box.append(remain);
     const release=document.createElement('button');release.type='button';release.textContent='Liberar pedido simulado';
     release.addEventListener('click',()=>{releaseDemoOrder(lab,order.requestId);feedback('Solicitud liberada. Los números vuelven a estar disponibles.');draw();});box.append(release);
   }
   if (held || payments.has(order.requestId)) {
     const pay = document.createElement('button');
     pay.type = 'button';
     pay.className = 'order-payment-button';
     pay.textContent = 'Abrir pago simulado';
     pay.setAttribute('aria-label', pay.textContent + ' para ' + title.textContent);
     pay.addEventListener('click', () => openPayment(order));
     box.append(pay);
   }
   list.append(box);
 }
 if(!lab.orders.length){const p=document.createElement('p');p.textContent='Todavía no hay solicitudes simuladas.';list.append(p);}
 $('order-count').textContent=lab.orders.length+' solicitudes de prueba';
}
$('place').addEventListener('click',()=>{
 const nums=[...selected].sort((a,b)=>a-b);if(!nums.length)return;
 const requestId = crypto.randomUUID();
 const outcome=placeDemoOrder(lab,nums,requestId);
 if(outcome.outcome==='conflict')feedback('Conflicto: otro pedido de esta pestaña ya ocupa algún número. No hay reserva parcial.',true);
 else {selected.clear();feedback('Pedido de prueba creado. Vence en 120 segundos; no se registra en el servidor.');}
 draw();
});
$('refresh').addEventListener('click',()=>{feedback('Estados de prueba actualizados.');draw();});
$('clear').addEventListener('click', () => {
  lab.orders.length = 0;
  selected.clear();
  payments.clear();
  activePaymentOrder = null;
  renderPayment();
  feedback('Laboratorio reiniciado.');
  draw();
});
$('payment-approve').addEventListener('click', () => simulateResult('APPROVED'));
$('payment-decline').addEventListener('click', () => simulateResult('DECLINED'));
$('payment-repeat').addEventListener('click', () => simulateResult());
$('previous').addEventListener('click',()=>{if(page>0){page--;draw();}});
$('next').addEventListener('click',()=>{if((page+1)*100<lab.total){page++;draw();}});
$('go').addEventListener('click',()=>{const n=Number($('number-search').value);if(!Number.isSafeInteger(n)||n<0||n>=lab.total){feedback('Número fuera de rango.',true);return;}page=Math.floor(n/100);draw();});
// Avance visual del reloj: solo cambia estado local y libera simulaciones vencidas.
setInterval(() => {
  if (!lab?.orders.length) return;
  const now = Date.now();
  let expired = false;
  for (const order of lab.orders) {
    if (order.state === 'held' && now >= order.expiresAt) {
      order.state = 'expired';
      expired = true;
    }
  }
  if (expired) {
    draw();
    return;
  }
  for (const label of $('orders').querySelectorAll('[data-expires-at]')) {
    updateCountdown(label, Number(label.dataset.expiresAt), now);
  }
}, 1000);
try{
 const cfg=parseDemoParams(location.search);lab=newDemoState(cfg.total,cfg.price);
 for(const n of cfg.numbers)selected.add(n);
 $('config-label').textContent=cfg.total.toLocaleString('es-CO')+' números · '+money(cfg.price)+' por número · máximo cinco';
 draw();
}catch(err){$('error').textContent='No se pudieron cargar los parámetros de ejemplo: '+err.message;$('error').hidden=false;$('experience').hidden=true;}
