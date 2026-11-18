/** V15: reglas sin privilegios para expediente interno. NO certifican autorización. */
export const BUCKET = 'ets-campaign-evidence';
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const DOCUMENT_KINDS = Object.freeze({
  authorization_claim: 'Documento de autorización declarado',
  prize_support: 'Soporte del premio',
  organizer_support: 'Soporte del organizador',
  other: 'Otro documento'
});
export const REVIEW_TYPES = Object.freeze({
  observation: 'Observación interna',
  request_changes: 'Solicitar correcciones',
  ready_for_external_review: 'Preparado para revisión externa'
});
const TYPES = Object.freeze({
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png'
});
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUUID(s) { return typeof s === 'string' && UUID.test(s); }
export function safeDocumentName(s) {
  return String(s || 'documento').split(/[\\/]/).pop().trim().slice(0, 180);
}
export function documentPath(raffleId, userId, file, id) {
  if (!isUUID(raffleId) || !isUUID(userId) || !isUUID(id)) throw Error('Identificadores inválidos.');
  if (!file || !Number.isSafeInteger(file.size) || file.size < 1 || file.size > MAX_DOCUMENT_BYTES) throw Error('El archivo debe pesar máximo 10 MB y no puede estar vacío.');
  const ext = TYPES[file.type];
  if (!ext) throw Error('Solo se admiten PDF, JPG o PNG.');
  if (!safeDocumentName(file.name)) throw Error('Archivo sin nombre.');
  return `${raffleId.toLowerCase()}/${userId.toLowerCase()}/${id.toLowerCase()}.${ext}`;
}
export function dossierEditable(raffle, role) {
  return Boolean(raffle && ['admin','operator'].includes(role) &&
    ['draft','in_review','awaiting_authorization'].includes(raffle.state) && !raffle.authorization_verified);
}
export function dossierChecklist({raffle,dossier,prize,documents=[]}={}) {
  const docs = Array.isArray(documents) ? documents : [];
  const items = [
    {id:'campaign', label:'Campaña registrada', detail:'Premio, numeración y valor registrados en el sistema', done:Boolean(raffle && raffle.title?.trim() && raffle.total_numbers>0 && raffle.ticket_price_cop>0)},
    {id:'prize', label:'Ficha del premio', detail:'Tipo, descripción y entrega registrados', done:Boolean(prize?.prize_kind && prize.prize_details?.trim() && prize.delivery_notes?.trim())},
    {id:'organizer', label:'Datos del organizador', detail:'Nombre, autoridad y número de autorización', done:Boolean(dossier?.organizer_name?.trim().length>=3 && dossier.competent_authority?.trim().length>=3 && dossier.authorization_reference_claimed?.trim())},
    {id:'evidence', label:'Soportes documentales', detail:'Se adjuntó un soporte privado de autorización declarada', done:docs.some(x=>x.document_kind==='authorization_claim')},
    {id:'date', label:'Fecha prevista', detail:'Sorteo o evento previsto registrado', done:Boolean(raffle?.draw_at && !Number.isNaN(Date.parse(raffle.draw_at)))},
    {id:'legal', label:'Verificación externa', detail:'Comprobación de la autorización para esta rifa', done:Boolean(raffle?.authorization_verified)}
  ];
  // Cumplir documentación NO acredita autorización. No permitir inferencia de publicación.
  return {items, completed:items.filter(x=>x.done).length, total:items.length,
    internalReady:items.slice(0,-1).every(x=>x.done), legallyEnabled:items.at(-1).done};
}
