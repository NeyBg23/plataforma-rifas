import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeInput,InputError,STAFF_ACTIONS} from '../supabase/functions/ets-manual-payments/validation.mjs';
const raffle = 'c3b1eb27-ade9-434f-ade4-6ce68f84f184';
const id = 'fa25e7ab-9db3-4bb3-901e-4e7ef9ac4650';
const valid = {action:'place',raffle_id:raffle,order_id:id,access_token:'a'.repeat(64),numbers:[2,1],customer_name:'Cliente de prueba',customer_contact:'+570000000000'};
test('El pedido normaliza números sin aceptar montos enviados por el cliente',() => {
  const result = normalizeInput({...valid,amount_cop:1,is_test:false});
  assert.deepEqual(result.numbers,[1,2]);
  assert.equal(result.is_test,false);
  assert.equal(result.amount_cop,undefined);
});
test('Rechaza selecciones, modos y accesos inválidos',() => {
  for (const change of [{numbers:[]},{numbers:[1,1]},{numbers:[1,2,3,4,5,6]},{numbers:['1']},{numbers:[-1]},
    {numbers:[Infinity]},{is_test:'true'},{access_token:'public'},{order_id:'otro'}, {customer_contact:'correo@example.com'}]) {
    assert.throws(() => normalizeInput({...valid,...change}),InputError);
  }
});
test('El QR queda restringido a la misma rifa y a tipos de imagen admitidos',() => {
  const settings = {action:'save_settings',raffle_id:raffle,recipient:'Titular prueba',institution:'Banco de prueba',payment_key:'LLAVE-PRUEBA',instructions:'Texto de prueba',qr_path:raffle+'/'+id+'.png',enabled:true};
  assert.equal(normalizeInput(settings).qr_path,settings.qr_path);
  for (const qr_path of [id+'/'+id+'.png',raffle+'/../archivo.png',raffle+'/'+id+'.svg','https://ejemplo.com/qr.png']) assert.throws(() => normalizeInput({...settings,qr_path}),InputError);
  assert.throws(() => normalizeInput({...settings,payment_key:'',qr_path:''}),InputError);
  assert.throws(() => normalizeInput({action:'qr_upload',raffle_id:raffle,content_type:'image/svg+xml'}),InputError);
});
test('La aprobación exige una decisión conocida y una nota de revisión',() => {
  const review = {action:'review',raffle_id:raffle,order_id:id,decision:'confirmed',note:'Ingreso verificado'};
  assert.equal(normalizeInput(review).decision,'confirmed');
  for (const change of [{decision:'paid'},{note:''},{note:'x'.repeat(501)}]) assert.throws(() => normalizeInput({...review,...change}),InputError);
});
test('La referencia y la página respetan límites explícitos',() => {
  assert.equal(normalizeInput({...valid,action:'report',payment_reference:' REF-123 '}).payment_reference,'REF-123');
  assert.throws(() => normalizeInput({...valid,action:'report',payment_reference:''}),InputError);
  assert.throws(() => normalizeInput({action:'quote',raffle_id:raffle,page:-1}),InputError);
});
test('Publicar ficha es una acción privada y no acepta el modo de prueba',()=> {
  for (const action of ['publication_status','publish_listing']) {
    assert.ok(STAFF_ACTIONS.has(action));
    const input = normalizeInput({action,raffle_id:raffle,actor_id:id,authorization_verified:true});
    assert.deepEqual(input,{action,raffle_id:raffle,is_test:false});
    assert.throws(()=>normalizeInput({action,raffle_id:raffle,is_test:true}),InputError);
  }
});
