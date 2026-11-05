import {
  isAllowedDraft,
  isUuid,
  normalizeRequest,
  numbersInRange,
} from '../supabase/functions/ets-orders-lab/validation.mjs';

const ENVIRONMENT = 'simulation';
const CURRENCY = 'COP';
const TRANSACTION_ID = /^SIM-[A-Za-z0-9-]{1,100}$/;
const SIMULATED_OUTCOMES = new Set(['APPROVED', 'DECLINED']);

function assertValidTime(now) {
  if (!Number.isSafeInteger(now) || now < 0) {
    throw new TypeError('Fecha de simulación inválida.');
  }
}

function isHeld(order, now) {
  return order.state === 'held_demo' && new Date(order.expires_at).getTime() > now;
}

// Recibe el pedido persistente y los datos del sorteo tal como los leería el servidor.
export function createSimulatedPayment(order, raffle, now = Date.now()) {
  assertValidTime(now);
  if (!isUuid(order?.id) || !isAllowedDraft(raffle) || order.raffle_id !== raffle.id || !isHeld(order, now)) {
    throw new Error('Se requiere un pedido vigente del borrador de laboratorio.');
  }

  const selection = normalizeRequest({
    action: 'place',
    raffle_id: order.raffle_id,
    request_id: order.request_id,
    numbers: order.numbers,
  });
  if (!numbersInRange(selection.numbers, raffle.total_numbers)) {
    throw new RangeError('El pedido tiene números fuera del rango del sorteo.');
  }

  const price = raffle.ticket_price_cop;
  if (!Number.isSafeInteger(price) || price <= 0) {
    throw new RangeError('Importe de simulación inválido.');
  }
  const amountInCents = selection.numbers.length * price * 100;
  if (!Number.isSafeInteger(amountInCents)) {
    throw new RangeError('Importe de simulación inválido.');
  }

  return {
    environment: ENVIRONMENT,
    orderId: order.id,
    reference: `ETS-LAB-${order.id}`,
    amountInCents,
    currency: CURRENCY,
    expiresAt: new Date(order.expires_at).getTime(),
    status: 'PENDING',
    transactionId: null,
    transactionStatus: null,
  };
}

// El evento pertenece al simulador local. El pedido y la retención son de solo lectura.
export function reconcileSimulatedPayment(payment, order, event, now = Date.now()) {
  assertValidTime(now);
  if (payment?.environment !== ENVIRONMENT || payment.orderId !== order?.id) {
    throw new Error('El pago simulado no pertenece al pedido.');
  }

  const transaction = event?.data?.transaction;
  if (event?.environment !== ENVIRONMENT || event.event !== 'transaction.updated' ||
      typeof transaction?.id !== 'string' || !TRANSACTION_ID.test(transaction.id) ||
      !SIMULATED_OUTCOMES.has(transaction.status)) {
    throw new Error('Evento de simulación inválido.');
  }
  if (transaction.reference !== payment.reference ||
      transaction.amount_in_cents !== payment.amountInCents || transaction.currency !== payment.currency) {
    throw new Error('La referencia, el monto o la moneda no coinciden.');
  }

  if (payment.transactionId !== null) {
    if (payment.transactionId !== transaction.id || payment.transactionStatus !== transaction.status) {
      throw new Error('El pedido ya tiene otro resultado de simulación.');
    }
    return payment;
  }

  const holdEnded = now >= payment.expiresAt || !isHeld(order, now);
  const status = transaction.status === 'APPROVED' && holdEnded ? 'REQUIRES_REVIEW' : transaction.status;
  return { ...payment, status, transactionId: transaction.id, transactionStatus: transaction.status };
}
