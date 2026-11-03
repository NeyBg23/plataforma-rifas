import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {isRaffleId,formatNumber,formatCOP,pickPreviewInfo,imageUrlIsPrivate} from '../admin/vista-previa-domain.mjs';
const html=readFileSync(new URL('../admin/vista-previa.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../admin/vista-previa.mjs',import.meta.url),'utf8');
const base='https://ncbdkllujiakleuhdhhr.supabase.co';
const raffle='c3b1eb27-ade9-434f-ade4-6ce68f84f184';

test('V17: IDs válidos y manipulaciones rechazadas',()=>{
  assert.equal(isRaffleId(raffle),true);
  for(const invalid of ['',null,'abc','../storage','c3b1eb27-ade9-434f-ade4-6ce68f84f184?other=1'])assert.equal(isRaffleId(invalid),false);
});

test('V17: numeración con ceros y límites',()=>{
  assert.equal(formatNumber(5,100),'05');
  assert.equal(formatNumber(0,10000),'0000');
  assert.equal(formatNumber(999999,1000000),'999999');
  assert.throws(()=>formatNumber(100,100),RangeError);
});

test('V17: datos de borrador sin afirmar que son públicos',()=>{
  const valid={id:raffle,title:'Moto de prueba',description:'',category:'moto',state:'draft',draw_at:null,ticket_price_cop:20000,total_numbers:100};
  assert.equal(pickPreviewInfo(valid)?.title,'Moto de prueba');
  assert.equal(pickPreviewInfo({...valid,total_numbers:1000001}),null);
  assert.equal(pickPreviewInfo({...valid,title:''}),null);
  assert.match(formatCOP(20000),/20[.,]000/);
});

test('V17: solo admite URLs temporales del bucket privado del mismo proyecto',()=>{
  const allowed='/storage/v1/object/sign/ets-prize-drafts/abc/file.jpg?token=abc';
  assert.equal(imageUrlIsPrivate(allowed,base),true);
  for(const disallowed of ['https://attacker.example/'+allowed,'http://ncbdkllujiakleuhdhhr.supabase.co'+allowed,'/storage/v1/object/public/ets-prize-drafts/a.jpg','/storage/v1/object/sign/ets-campaign-evidence/a.pdf?token=x','/storage/v1/object/sign/ets-prize-drafts/a.jpg'])assert.equal(imageUrlIsPrivate(disallowed,base),false);
});

test('V17: consulta privada después de verificar sesión y personal',()=>{
  const session=app.indexOf('auth.getUser()');
  const staff=app.indexOf("from('ets_staff_members')");
  const raffleRead=app.indexOf("from('ets_raffles')");
  assert.ok(session>0 && staff>session && raffleRead>staff);
  assert.match(app,/staff\?\.enabled/);
  assert.match(app,/\['admin','operator','auditor'\]/);
  assert.match(app,/createSignedUrls\(paths,120\)/);
});

test('V17: no crea reservas, pedidos, cobros ni boletas',()=>{
  assert.doesNotMatch(app,/\.from\([^)]*\)\.(?:insert|upsert|update|delete)\(|\.rpc\(|checkout\(|createPayment|purchase\(/i);
  assert.match(html,/Comprar números · no habilitado/);
  assert.match(html,/Esta selección no se guarda ni crea un pedido/);
  assert.match(html,/Wompi previsto · Integración pendiente/);
});

test('V17: datos visibles siempre por texto y fotos firmadas',()=>{
  assert.doesNotMatch(app,/innerHTML|outerHTML|document\.write|eval\(/);
  assert.match(app,/\.textContent=/);
  assert.match(app,/imageUrlIsPrivate\(entry\.signedUrl,cfg\.url\)/);
  assert.match(html,/VISTA PRIVADA DE DESARROLLO/);
});