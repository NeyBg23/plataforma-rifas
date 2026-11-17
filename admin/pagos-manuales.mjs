import {authClient,paymentRequest,money,numberLabel,dateLabel,states,node,showQr,setupTheme} from '../pagos/api.mjs';
const $ = id => document.getElementById(id);
const raffleId = new URLSearchParams(location.search).get('rifa');
const state = {client:null,raffle:null,role:null,qrPath:'',isTest:true,busy:false,page:0,hasMore:false};
setupTheme($('theme-toggle'));
function status(message,error = false) { $('status').textContent = message; $('status').dataset.error = String(error); }
function request(action,fields = {}) {
  return paymentRequest({action,raffle_id:raffleId,is_test:state.isTest,...fields},state.client);
}
function busy(value) {
  state.busy = value;
  for (const element of $('settings-form').elements) element.disabled = value || state.role === 'auditor';
  $('real-orders').disabled = value;
  $('test-orders').disabled = value;
  $('refresh-orders').disabled = value;
  $('orders-previous').disabled = value || state.page === 0;
  $('orders-next').disabled = value || !state.hasMore;
  $('orders').querySelectorAll('button,textarea').forEach(element => element.disabled = value);
}
function renderSettings(result) {
  const settings = result.settings;
  state.qrPath = settings?.qr_path || '';
  for (const key of ['recipient','institution','payment_key','instructions']) $('settings-form').elements.namedItem(key).value = settings?.[key] || '';
  $('enabled').checked = settings?.enabled === true;
  $('remove-qr').checked = false;
  $('qr-file').value = '';
  $('preview-recipient').textContent = settings ? settings.recipient + ' · ' + settings.institution : 'Aún no has guardado los datos.';
  $('preview-key').textContent = settings?.payment_key || '';
  $('preview-instructions').textContent = settings?.instructions || '';
  showQr($('preview-qr'),result.payment?.qr_url);
}
function renderOrders(orders) {
  const container = $('orders');
  container.replaceChildren();
  $('real-orders').setAttribute('aria-pressed',String(!state.isTest));
  $('test-orders').setAttribute('aria-pressed',String(state.isTest));
  $('orders-mode').textContent = state.isTest ? 'Modo prueba. Usa datos ficticios para verificar el recorrido.' : 'Transferencias de clientes. Revisa el ingreso en tu entidad antes de aprobar.';
  if (!orders.length) { container.append(node('p','Todavía no hay pedidos en esta vista.','empty')); return; }
  for (const order of orders) {
    const card = node('article',undefined,'payment-order');
    card.append(node('h3',order.numbers.map(n => numberLabel(n,state.raffle.total_numbers)).join(' · ')),
      node('strong',money(order.amount_cop)),node('span',states[order.state] || order.state,'pill'),
      node('p',order.customer_name + ' · ' + order.customer_contact),
      node('p','Creado el ' + dateLabel(order.created_at)),node('code',order.id,'payment-ref'));
    if (order.payment_reference) card.append(node('p','Referencia de transferencia · ' + order.payment_reference));
    if (order.state === 'awaiting_payment') card.append(node('p','Plazo para reportar el pago · ' + dateLabel(order.expires_at)));
    if (order.review_note) card.append(node('p','Revisión · ' + order.review_note));
    if (order.state === 'pending_review' && state.role !== 'auditor') {
      const form = node('form',undefined,'form-stack');
      const label = node('label','Nota de revisión');
      const note = node('textarea');
      note.name = 'note'; note.required = true; note.minLength = 3; note.maxLength = 500;
      note.placeholder = 'Escribe qué verificaste en la transferencia.';
      label.append(note);
      const actions = node('div',undefined,'form-actions');
      for (const [decision,title] of [['confirmed','Confirmar pago'],['rejected','Rechazar pago']]) {
        const button = node('button',title,decision === 'confirmed' ? 'btn primary' : 'btn text');
        button.type = 'submit'; button.name = 'decision'; button.value = decision; actions.append(button);
      }
      form.append(label,actions);
      form.addEventListener('submit',event => {
        event.preventDefault();
        if (!form.reportValidity() || state.busy) return;
        void review(order.id,event.submitter?.value,note.value);
      });
      card.append(form);
    }
    container.append(card);
  }
}
async function refresh() {
  const result = await request('list_orders',{page:state.page});
  state.hasMore = result.has_more;
  $('orders-page').textContent = 'Página ' + (state.page+1);
  renderOrders(result.orders);
}
async function run(operation) {
  if (state.busy) return;
  busy(true);
  try { await operation(); }
  catch (error) { status(error.message || 'No se pudo completar la operación.',true); }
  finally { busy(false); }
}
async function review(id,decision,note) {
  await run(async () => {
    await request('review',{order_id:id,decision,note});
    await refresh();
    status(decision === 'confirmed' ? 'Pago confirmado. Los números del pedido quedaron confirmados.' : 'Pago rechazado. Los números volvieron a estar disponibles.');
  });
}
$('settings-form').addEventListener('submit',event => {
  event.preventDefault();
  if (!$('settings-form').reportValidity()) return;
  const values = new FormData($('settings-form'));
  const fields = Object.fromEntries(['recipient','institution','payment_key','instructions'].map(key => [key,String(values.get(key) || '')]));
  fields.enabled = $('enabled').checked;
  const file = $('qr-file').files[0];
  const removeQr = $('remove-qr').checked;
  void run(async () => {
    let path = removeQr ? '' : state.qrPath;
    if (file) {
      if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('Usa una imagen PNG, JPG o WebP de máximo 5 MB.');
      status('Subiendo tu imagen QR…');
      const upload = await request('qr_upload',{content_type:file.type});
      const result = await state.client.storage.from('ets-payment-qr').uploadToSignedUrl(upload.path,upload.token,file,{contentType:file.type});
      if (result.error) throw new Error('No se pudo subir el QR. Vuelve a intentar.');
      path = upload.path;
    }
    await request('save_settings',{...fields,qr_path:path});
    renderSettings(await request('admin_get'));
    status('QR e instrucciones guardados. Ya puedes probar el recorrido completo.');
  });
});
$('refresh-orders').addEventListener('click',() => void run(async () => { await refresh(); status('Pedidos actualizados.'); }));
for (const [id,isTest] of [['real-orders',false],['test-orders',true]]) $(id).addEventListener('click',() => void run(async () => {
  state.isTest = isTest; state.page = 0; await refresh(); status('Vista de pedidos actualizada.');
}));
for (const [id,delta] of [['orders-previous',-1],['orders-next',1]]) $(id).addEventListener('click',() => void run(async () => {
  const previous = state.page;
  state.page += delta;
  try { await refresh(); } catch (error) { state.page = previous; throw error; }
}));
async function start() {
  state.client = authClient();
  const result = await request('admin_get');
  state.raffle = result.raffle;
  state.role = result.role;
  state.isTest = result.raffle.state !== 'published';
  $('raffle-title').textContent = result.raffle.title;
  renderSettings(result);
  const paymentUrl = new URL('../pagar/',location.href);
  paymentUrl.searchParams.set('rifa',raffleId);
  $('public-payment').href = paymentUrl.href;
  const published = result.raffle.state === 'published' && result.raffle.authorization_verified;
  $('public-payment').hidden = !published;
  paymentUrl.searchParams.set('modo','prueba');
  $('test-payment').href = paymentUrl.href;
  $('publication-note').textContent = published ? 'El pago para clientes estará disponible al activar un QR o una llave y mientras el sorteo esté vigente.' : 'Este sorteo está en preparación. Puedes guardar el QR y probar todo el recorrido en privado. El acceso de clientes requiere que el sorteo esté publicado y habilitado.';
  $('workspace').hidden = false;
  busy(false);
  await refresh();
  status('Panel conectado. Configura el pago o revisa los pedidos.');
}
void start().catch(error => status(error.message,true));
