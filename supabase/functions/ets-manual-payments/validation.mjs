export class InputError extends Error {}
export const MAX_BODY_BYTES = 16384;
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PUBLICATION_ACTIONS = new Set(['publication_status','publish_listing']);
export const STAFF_ACTIONS = new Set(['admin_get','save_settings','qr_upload','list_orders','review',...PUBLICATION_ACTIONS]);
const ACTIONS = new Set([...STAFF_ACTIONS,'quote','place','status','report']);
function text(value, min, max, label) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) {
    throw new InputError('Revisa ' + label + '.');
  }
  return value.trim();
}
export function normalizeInput(value) {
  if (!value || typeof value !== 'object' || !ACTIONS.has(value.action) || typeof value.raffle_id !== 'string' || !UUID.test(value.raffle_id)) {
    throw new InputError('Solicitud inválida. Abre el sorteo desde el panel.');
  }
  if (value.is_test !== undefined && typeof value.is_test !== 'boolean') throw new InputError('Modo inválido.');
  const input = {action:value.action, raffle_id:value.raffle_id, is_test:value.is_test === true};
  if (PUBLICATION_ACTIONS.has(input.action) && input.is_test) throw new InputError('La publicación se gestiona desde el expediente.');
  if (['quote','list_orders'].includes(input.action)) {
    input.page = value.page ?? 0;
    if (!Number.isSafeInteger(input.page) || input.page < 0 || input.page > 9999) throw new InputError('Página inválida.');
  }
  if (['place','status','report','review'].includes(input.action)) {
    if (typeof value.order_id !== 'string' || !UUID.test(value.order_id)) throw new InputError('Pedido inválido.');
    input.order_id = value.order_id;
  }
  if (['place','status','report'].includes(input.action)) {
    if (typeof value.access_token !== 'string' || !/^[a-f0-9]{64}$/.test(value.access_token)) throw new InputError('Falta el acceso privado al pedido.');
    input.access_token = value.access_token;
  }
  if (input.action === 'place') {
    if (!Array.isArray(value.numbers) || value.numbers.length < 1 || value.numbers.length > 5 ||
      value.numbers.some(n => !Number.isSafeInteger(n) || n < 0 || n > 999999) || new Set(value.numbers).size !== value.numbers.length) {
      throw new InputError('Selecciona entre uno y cinco números diferentes.');
    }
    input.numbers = [...value.numbers].sort((a,b) => a-b);
    input.customer_name = text(value.customer_name,3,100,'el nombre');
    input.customer_contact = text(value.customer_contact,7,19,'el teléfono').replace(/[\s()-]/g,'');
    if (!/^\+?[0-9]{7,18}$/.test(input.customer_contact)) throw new InputError('Escribe el teléfono con indicativo, por ejemplo +573001234567.');
  }
  if (input.action === 'report') input.payment_reference = text(value.payment_reference,3,120,'la referencia de la transferencia');
  if (input.action === 'review') {
    if (!['confirmed','rejected'].includes(value.decision)) throw new InputError('Decisión inválida.');
    input.decision = value.decision;
    input.note = text(value.note,3,500,'la nota de revisión');
  }
  if (input.action === 'save_settings') {
    input.recipient = text(value.recipient,3,120,'el titular');
    input.institution = text(value.institution,2,100,'el banco o billetera');
    input.payment_key = text(value.payment_key ?? '',0,160,'la llave');
    input.instructions = text(value.instructions ?? '',0,1500,'las instrucciones');
    input.qr_path = text(value.qr_path ?? '',0,240,'la imagen QR');
    if (input.qr_path && !new RegExp('^' + input.raffle_id + '/[a-f0-9-]{36}\\.(png|jpg|webp)$','i').test(input.qr_path)) throw new InputError('Imagen QR inválida. Súbela de nuevo.');
    if (typeof value.enabled !== 'boolean') throw new InputError('Configuración inválida.');
    input.enabled = value.enabled;
    if (input.enabled && !input.payment_key && !input.qr_path) throw new InputError('Agrega una llave o una imagen QR.');
  }
  if (input.action === 'qr_upload') {
    const extensions = {'image/png':'png','image/jpeg':'jpg','image/webp':'webp'};
    if (!Object.hasOwn(extensions,value.content_type)) throw new InputError('Usa una imagen PNG, JPG o WebP.');
    input.extension = extensions[value.content_type];
  }
  return input;
}
