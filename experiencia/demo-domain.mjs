/** Contratos de dominio para la experiencia ficticia V11.
 * NO representa reservas de inventario ni pagos.
 */
export const MAX_SELECTION = 5;
export const SCHEMA_VERSION = 1;
export const STORAGE_KEY = 'ets_v11_demo_orders_v1';

export function formatCOP(value) {
  return new Intl.NumberFormat('es-CO', {style:'currency', currency:'COP', maximumFractionDigits:0}).format(value);
}

export function formatNumber(number, total) {
  const width = Math.max(2, String(Math.max(0, total - 1)).length);
  return String(number).padStart(width, '0');
}

export function normalizeNumbers(raw, maxNumber, maxCount=MAX_SELECTION) {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > maxCount) throw new Error(`Selecciona entre 1 y ${maxCount} números.`);
  if (!Number.isSafeInteger(maxNumber) || maxNumber < 1) throw new Error('Inventario de ejemplo inválido.');
  const numbers = raw.map(n => Number(n));
  if (numbers.some(n => !Number.isInteger(n) || n < 0 || n >= maxNumber)) throw new Error('Hay números fuera del rango permitido.');
  if (new Set(numbers).size !== numbers.length) throw new Error('No se pueden repetir números.');
  return numbers.sort((a,b) => a-b);
}

export function calculateTotal(price, selected) {
  if (!Number.isSafeInteger(price) || price <= 0) throw new Error('Precio inválido.');
  return price * selected.length;
}

export function createDemoOrder({raffle, selected, reference, now}) {
  if (!raffle || typeof raffle.id !== 'string' || !raffle.id) throw new Error('Premio inválido.');
  if (!/^DEMO-[A-Z0-9]{8}$/.test(reference)) throw new Error('Referencia inválida.');
  if (!Number.isFinite(Date.parse(now))) throw new Error('Fecha inválida.');
  const numbers = normalizeNumbers(selected, raffle.total);
  return Object.freeze({
    schemaVersion: SCHEMA_VERSION,
    reference,
    raffleId: raffle.id,
    prizeName: raffle.name,
    numbers,
    unitPriceCOP: raffle.price,
    totalCOP: calculateTotal(raffle.price,numbers),
    status: 'demo_created',
    createdAt: now,
    events: [
      {key:'selection', label:'Números elegidos en simulación', at:now},
      {key:'summary', label:'Resumen de ejemplo revisado', at:now},
      {key:'demo_created',label:'Referencia local de demostración creada',at:now}
    ]
  });
}

export function isDemoOrder(value) {
  return Boolean(value && value.schemaVersion === SCHEMA_VERSION && /^DEMO-[A-Z0-9]{8}$/.test(value.reference || '') && value.status === 'demo_created' && Array.isArray(value.numbers) && value.numbers.length > 0 && value.numbers.length <= MAX_SELECTION && Array.isArray(value.events));
}

export function loadOrders(storage) {
  try {
    const parsed=JSON.parse(storage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isDemoOrder).slice(0,20) : [];
  } catch { return []; }
}

export function saveOrder(storage, order) {
  if (!isDemoOrder(order)) throw new Error('No es una simulación válida.');
  const previous = loadOrders(storage);
  const existing = previous.find(x => x.reference===order.reference);
  if (existing) {
    if (existing.raffleId!==order.raffleId || JSON.stringify(existing.numbers)!==JSON.stringify(order.numbers)) throw new Error('Referencia reutilizada con datos diferentes.');
    return existing;
  }
  const next = [order,...previous].slice(0,20);
  storage.setItem(STORAGE_KEY,JSON.stringify(next));
  return order;
}

export function findOrder(storage, reference) {
  const normalized=String(reference||'').trim().toUpperCase();
  return loadOrders(storage).find(x=>x.reference===normalized) ?? null;
}