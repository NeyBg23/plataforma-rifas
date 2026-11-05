import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSimulatedPayment,
  reconcileSimulatedPayment,
} from '../laboratorio/pago-simulado-domain.mjs';

const now = Date.parse('2026-11-05T20:00:00Z');
const raffle = Object.freeze({
  id: 'a16bb1ac-e3d8-4e54-8b54-6ee8b9f222ae',
  state: 'draft',
  authorization_verified: false,
  total_numbers: 100,
  ticket_price_cop: 20_000,
});
const order = Object.freeze({
  id: '6be53344-b1b3-4229-b95a-70b86f85eaf0',
  raffle_id: raffle.id,
  request_id: '91daff3b-264c-4215-8e29-008a4c44f9f0',
  numbers: Object.freeze([13, 21]),
  state: 'held_demo',
  expires_at: new Date(now + 120_000).toISOString(),
});

function eventFor(payment, status, overrides = {}) {
  return {
    event: 'transaction.updated',
    environment: 'simulation',
    data: {
      transaction: {
        id: 'SIM-1',
        reference: payment.reference,
        amount_in_cents: payment.amountInCents,
        currency: payment.currency,
        status,
        ...overrides,
      },
    },
  };
}

test('vincula un pedido vigente a una referencia estable y calcula centavos COP', () => {
  const payment = createSimulatedPayment(order, raffle, now);
  assert.equal(payment.orderId, order.id);
  assert.equal(payment.reference, `ETS-LAB-${order.id}`);
  assert.equal(payment.reference, createSimulatedPayment(order, raffle, now + 1).reference);
  assert.equal(payment.amountInCents, 4_000_000);
  assert.equal(payment.currency, 'COP');
  assert.equal(payment.status, 'PENDING');
  assert.equal(payment.expiresAt, now + 120_000);
  const expiresAt = new Date(now + 120_321);
  assert.equal(createSimulatedPayment({ ...order, expires_at: expiresAt }, raffle, now + 120_320).expiresAt, expiresAt.getTime());
});

test('rechaza pedidos vencidos, liberados, ajenos o de una rifa comercial', () => {
  assert.throws(() => createSimulatedPayment(order, raffle, now + 120_000), /pedido vigente/);
  assert.throws(() => createSimulatedPayment({ ...order, state: 'released_demo' }, raffle, now), /pedido vigente/);
  assert.throws(() => createSimulatedPayment({ ...order, raffle_id: order.id }, raffle, now), /pedido vigente/);
  assert.throws(() => createSimulatedPayment(order, { ...raffle, authorization_verified: true }, now), /pedido vigente/);
});

test('rechaza números fuera de rango, duplicados e importes inválidos', () => {
  assert.throws(() => createSimulatedPayment({ ...order, numbers: [100] }, raffle, now), /fuera del rango/);
  assert.throws(() => createSimulatedPayment({ ...order, numbers: [13, 13] }, raffle, now), /repetidos/);
  assert.throws(() => createSimulatedPayment(order, { ...raffle, ticket_price_cop: 0 }, now), /Importe/);
});

test('concilia una aprobación o un rechazo de prueba sin cambiar el pedido', () => {
  for (const status of ['APPROVED', 'DECLINED']) {
    const pending = createSimulatedPayment(order, raffle, now);
    const result = reconcileSimulatedPayment(pending, order, eventFor(pending, status), now + 1);
    assert.equal(result.status, status);
    assert.equal(result.transactionId, 'SIM-1');
    assert.equal(pending.status, 'PENDING');
    assert.equal(order.state, 'held_demo');
  }
});

test('reconoce el mismo resultado repetido y rechaza un resultado contradictorio', () => {
  const pending = createSimulatedPayment(order, raffle, now);
  const approved = eventFor(pending, 'APPROVED');
  const payment = reconcileSimulatedPayment(pending, order, approved, now + 1);
  assert.strictEqual(reconcileSimulatedPayment(payment, order, approved, now + 120_000), payment);
  assert.throws(() => reconcileSimulatedPayment(payment, order, eventFor(payment, 'DECLINED'), now + 1), /otro resultado/);
  assert.throws(() => reconcileSimulatedPayment(payment, order, eventFor(payment, 'APPROVED', { id: 'SIM-2' }), now + 1), /otro resultado/);
});

test('una aprobación tardía o de un pedido liberado queda para revisión', () => {
  const pending = createSimulatedPayment(order, raffle, now);
  const event = eventFor(pending, 'APPROVED');
  const expired = reconcileSimulatedPayment(pending, order, event, now + 120_000);
  assert.equal(expired.status, 'REQUIRES_REVIEW');
  assert.strictEqual(reconcileSimulatedPayment(expired, order, event, now + 120_001), expired);
  const released = { ...order, state: 'released_demo' };
  assert.equal(reconcileSimulatedPayment(pending, released, event, now + 1).status, 'REQUIRES_REVIEW');
  assert.equal(released.state, 'released_demo');
});

test('rechaza datos de otro pedido, diferencias de monto o moneda y eventos externos', () => {
  const pending = createSimulatedPayment(order, raffle, now);
  for (const overrides of [
    { reference: 'ETS-LAB-OTRO' },
    { amount_in_cents: pending.amountInCents - 1 },
    { currency: 'USD' },
  ]) {
    assert.throws(() => reconcileSimulatedPayment(pending, order, eventFor(pending, 'APPROVED', overrides), now), /no coinciden/);
  }
  const event = eventFor(pending, 'APPROVED');
  assert.throws(() => reconcileSimulatedPayment(pending, { ...order, id: raffle.id }, event, now), /no pertenece/);
  assert.throws(() => reconcileSimulatedPayment(pending, order, { ...event, environment: 'test' }, now), /Evento/);
  assert.throws(() => reconcileSimulatedPayment(pending, order, eventFor(pending, 'APPROVED', { id: '1234-1610641025-49201' }), now), /Evento/);
});
