import {authClient,paymentRequest,money,numberLabel,dateLabel,states,node,showQr,setupTheme} from '../pagos/api.mjs';
const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const raffleId = params.get('rifa');
const isTest = params.get('modo') === 'prueba';
const storageKey = 'ets-manual-order:' + raffleId + ':' + isTest;
const state = {client:null,raffle:null,selected:new Set(),unavailable:new Set(),page:0,access:null,order:null,busy:false};
setupTheme($('theme-toggle'));
$('test-banner').hidden = !isTest;
$('back-admin').hidden = !isTest;
function status(message,error = false) { $('status').textContent = message; $('status').dataset.error = String(error); }
function request(action,extra = {}) { return paymentRequest({action,raffle_id:raffleId,is_test:isTest,...extra},state.client); }
function busy(value) {
  state.busy = value;
  for (const id of ['order-form','report-form']) for (const element of $(id).elements) element.disabled = value;
  $('create-order').disabled = value || !state.selected.size;
  for (const id of ['previous','next','refresh-order','new-order']) $(id).disabled = value;
  if (state.raffle && !state.order) renderNumbers();
}
function remember() {
  // Guardar antes de enviar permite reintentar una respuesta perdida sin duplicar pedidos.
  localStorage.setItem(storageKey,JSON.stringify({order_id:state.access.order_id,access_token:state.access.access_token}));
}
function renderNumbers() {
  const total = state.raffle.total_numbers;
  const grid = $('number-grid');
  grid.replaceChildren();
  for (let n = state.page*100; n < Math.min((state.page+1)*100,total); n++) {
    const button = node('button',numberLabel(n,total));
    button.type = 'button'; button.disabled = state.busy || state.unavailable.has(n);
    button.setAttribute('aria-pressed',String(state.selected.has(n)));
    button.setAttribute('aria-label','Número ' + numberLabel(n,total) + (state.unavailable.has(n) ? ' ocupado' : ''));
    button.addEventListener('click',() => {
      if (state.selected.has(n)) state.selected.delete(n);
      else if (state.selected.size < 5) state.selected.add(n);
      else { status('El máximo es de cinco números por pedido.',true); return; }
      state.access = null;
      renderNumbers();
    });
    grid.append(button);
  }
  const selected = [...state.selected].sort((a,b) => a-b);
  $('selected-numbers').textContent = selected.map(n => numberLabel(n,total)).join(' · ') || '—';
  $('selected-total').textContent = money(selected.length*state.raffle.ticket_price_cop);
  $('pagination').textContent = (state.page+1) + ' / ' + Math.ceil(total/100);
  $('previous').disabled = state.busy || state.page === 0;
  $('next').disabled = state.busy || (state.page+1)*100 >= total;
  $('create-order').disabled = state.busy || !selected.length;
}
async function quote() {
  const result = await request('quote',{page:state.page});
  state.raffle = result.raffle;
  state.unavailable = new Set(result.unavailable);
  for (const n of state.unavailable) state.selected.delete(n);
  $('raffle-title').textContent = state.raffle.title;
  $('price').textContent = money(state.raffle.ticket_price_cop) + ' por número';
  $('selection').hidden = false;
  $('order').hidden = true;
  renderNumbers();
}
function renderOrder(order) {
  state.order = order;
  $('selection').hidden = true;
  $('order').hidden = false;
  const details = order.payment_details;
  $('recipient').textContent = details.recipient + ' · ' + details.institution;
  $('payment-key').textContent = details.payment_key;
  $('copy-key').hidden = !details.payment_key;
  $('payment-instructions').textContent = details.instructions;
  showQr($('payment-qr'),details.qr_url);
  $('order-state').textContent = states[order.state] || order.state;
  $('order-numbers').textContent = order.numbers.map(n => state.raffle ? numberLabel(n,state.raffle.total_numbers) : String(n)).join(' · ');
  $('order-total').textContent = money(order.amount_cop);
  $('order-reference').textContent = order.id;
  $('report-form').hidden = order.state !== 'awaiting_payment';
  $('new-order').hidden = ['awaiting_payment','pending_review'].includes(order.state);
  $('review-note').hidden = !order.review_note;
  $('review-note').textContent = order.review_note || '';
  $('payment-deadline').textContent = order.state === 'awaiting_payment' ? 'Tienes hasta el ' + dateLabel(order.expires_at) + ' para reportar tu transferencia.' :
    order.state === 'pending_review' ? 'Transferencia reportada. Tus números están retenidos mientras el administrador revisa el ingreso.' :
    order.state === 'confirmed' ? 'Pago confirmado por el administrador.' : 'Este pedido terminó. Consulta con el administrador si realizaste una transferencia.';
  // Tras el vencimiento se retira el QR para evitar una transferencia tardía.
  if (['expired','rejected','confirmed'].includes(order.state)) {
    $('payment-qr').hidden = true; $('copy-key').hidden = true; $('payment-key').hidden = true;
  } else { $('payment-key').hidden = false; }
}
async function refreshOrder() {
  const result = await request('status',{order_id:state.access.order_id,access_token:state.access.access_token});
  state.raffle = result.raffle;
  $('raffle-title').textContent = state.raffle.title;
  renderOrder(result.order);
}
async function run(operation) {
  if (state.busy) return;
  busy(true);
  try { await operation(); }
  catch (error) { status(error.message || 'No se pudo completar. Puedes reintentar.',true); }
  finally { busy(false); }
}
$('order-form').addEventListener('submit',event => {
  event.preventDefault();
  if (!$('order-form').reportValidity() || !state.selected.size) return;
  const values = new FormData($('order-form'));
  const customerName = String(values.get('customer_name') || '').trim();
  const customerContact = String(values.get('customer_contact') || '').replace(/[\s()-]/g,'');
  const numbers = [...state.selected].sort((a,b) => a-b);
  const signature = JSON.stringify([numbers,customerName,customerContact]);
  void run(async () => {
    if (state.access?.signature !== signature) state.access = {
      order_id:crypto.randomUUID(),access_token:crypto.randomUUID().replaceAll('-','') + crypto.randomUUID().replaceAll('-',''),signature
    };
    remember();
    status('Comprobando disponibilidad y guardando tu pedido…');
    try {
      const result = await request('place',{...state.access,numbers,customer_name:customerName,customer_contact:customerContact});
      renderOrder(result.order);
      status(isTest ? 'Pedido de prueba guardado. Continúa con una referencia ficticia.' : 'Pedido guardado. Transfiere el valor indicado y reporta la referencia.');
    } catch (error) {
      if (error.conflict) { state.access = null; localStorage.removeItem(storageKey); await quote(); }
      throw error;
    }
  });
});
$('report-form').addEventListener('submit',event => {
  event.preventDefault();
  const reference = $('transfer-reference').value.trim();
  if (!$('report-form').reportValidity()) return;
  void run(async () => {
    const result = await request('report',{order_id:state.access.order_id,access_token:state.access.access_token,payment_reference:reference});
    renderOrder(result.order);
    status('Referencia recibida. El administrador revisará tu transferencia.');
  });
});
$('refresh-order').addEventListener('click',() => void run(async () => { await refreshOrder(); status('Estado actualizado.'); }));
$('copy-key').addEventListener('click',async () => {
  try { await navigator.clipboard.writeText(state.order.payment_details.payment_key); status('Llave copiada.'); }
  catch { status('Selecciona y copia la llave que aparece en pantalla.',true); }
});
$('new-order').addEventListener('click',() => void run(async () => {
  const previousAccess = state.access;
  state.order = null; state.access = null; state.selected.clear();
  try { await quote(); localStorage.removeItem(storageKey); status('Elige los números del siguiente pedido.'); }
  catch (error) { state.access = previousAccess; await refreshOrder(); throw error; }
}));
for (const [id,delta] of [['previous',-1],['next',1]]) $(id).addEventListener('click',() => void run(async () => {
  const previousPage = state.page;
  state.page += delta;
  try { await quote(); } catch (error) { state.page = previousPage; throw error; }
}));
async function start() {
  $('retry-loading').hidden = true;
  if (isTest) state.client = authClient();
  let stored;
  try { stored = JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch {}
  if (stored && typeof stored.order_id === 'string' && /^[a-f0-9]{64}$/.test(stored.access_token || '')) {
    state.access = stored;
    try { await refreshOrder(); status('Recuperamos el estado de tu pedido.'); return; }
    catch (error) {
      if (error.status !== 422 || error.message !== 'Pedido no encontrado.') throw error;
      state.access = null;
      localStorage.removeItem(storageKey);
    }
  }
  await quote();
  status('Elige tus números para continuar.');
}
$('retry-loading').addEventListener('click',() => void start().catch(initializationError));
function initializationError(error) {
  status(error.message,true);
  $('retry-loading').hidden = false;
}
setInterval(() => {
  if (state.busy || document.hidden || !state.order || !['awaiting_payment','pending_review'].includes(state.order.state)) return;
  void run(async () => { await refreshOrder(); });
},20000);
void start().catch(initializationError);
