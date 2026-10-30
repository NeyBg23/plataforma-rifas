import test from 'node:test';
import assert from 'node:assert/strict';
import {paymentProvider,paymentReadiness,beginPayment,PAYMENT_REQUIREMENTS} from '../experiencia/payment-gate.mjs';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const here = new URL('../experiencia/',import.meta.url);
test('no existe pasarela activa ni ambiente de pago configurado',()=>{
  assert.equal(paymentProvider.id,'wompi');
  assert.equal(paymentProvider.checkoutEnabled,false);
  assert.equal(paymentProvider.environment,'none');
  assert.equal(paymentReadiness().status,'disabled');
});
test('cualquier intento programático de pago se rechaza',()=>{
  assert.throws(()=>beginPayment(),/Pagos desactivados/);
});
test('validaciones técnicas y comerciales pendientes',()=>{
  assert.ok(PAYMENT_REQUIREMENTS.length>=6);
  assert.ok(PAYMENT_REQUIREMENTS.some(x=>x.includes('webhooks')));
  assert.ok(PAYMENT_REQUIREMENTS.some(x=>x.includes('comercio')));
});
test('frontend no carga widget externo ni credenciales',()=>{
  for(const file of ['index.html','app.mjs','payment-gate.mjs']){
    const s=readFileSync(new URL(file,here),'utf8');
    assert.doesNotMatch(s,/checkout\.wompi\.co|pub_(?:test|prod)_|prod_integrity_|test_integrity_|service_role|sb_secret_/i);
  }
});
test('página pública describe claramente simulación',()=>{
  const s=readFileSync(new URL('index.html',here),'utf8');
  assert.match(s,/SIN PAGOS NI BOLETAS REALES/);
  const app=readFileSync(new URL('app.mjs',here),'utf8');
  assert.match(app,/data-action="create"/);
  assert.match(app,/Pagar con Wompi · Próximamente/);
});