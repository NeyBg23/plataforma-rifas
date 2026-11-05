import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeRequest,isUuid,canUseLab,isAllowedDraft,numbersInRange,MAX_LAB_NUMBERS,LAB_TTL_SECONDS,ValidationError} from '../admin/lab-validation.mjs';
import * as serverRules from '../supabase/functions/ets-orders-lab/validation.mjs';
const uuid='c3b1eb27-ade9-434f-ade4-6ce68f84f184';
const order='fa25e7ab-9db3-4bb3-901e-4e7ef9ac4650';
const edge=readFileSync(new URL('../supabase/functions/ets-orders-lab/index.ts',import.meta.url),'utf8');
const client=readFileSync(new URL('../admin/pedidos-lab.mjs',import.meta.url),'utf8');
const html=readFileSync(new URL('../admin/pedidos-lab.html',import.meta.url),'utf8');

test('V18.2: solicitudes de laboratorio válidas y estables',()=>{
 assert.ok(isUuid(uuid));
 assert.equal(LAB_TTL_SECONDS,120);
 assert.equal(MAX_LAB_NUMBERS,5);
 const result=normalizeRequest({action:'place',raffle_id:uuid,request_id:order,numbers:[4,1,3]});
 assert.deepEqual(result.numbers,[1,3,4]);
 assert.equal(result.request_id,order);
 assert.equal(normalizeRequest({action:'list',raffle_id:uuid}).action,'list');
 assert.equal(normalizeRequest({action:'expire',raffle_id:uuid}).action,'expire');
 assert.equal(normalizeRequest({action:'release',raffle_id:uuid,order_id:order}).order_id,order);
});

test('V18.2: rechaza duplicados, faltantes, rangos y formatos maliciosos',()=>{
 for(const numbers of [[],[1,1],[1,2,3,4,5,6],[-1],[1.25],['1'],[null],[NaN]]){
  assert.throws(()=>normalizeRequest({action:'place',raffle_id:uuid,request_id:order,numbers}),ValidationError);
 }
 for(const action of ['checkout','pay','purchase','reserve','published','delete','']){
  assert.throws(()=>normalizeRequest({action,raffle_id:uuid}),ValidationError);
 }
 assert.throws(()=>normalizeRequest({action:'place',raffle_id:'../../private',request_id:order,numbers:[2]}),ValidationError);
 assert.throws(()=>normalizeRequest({action:'release',raffle_id:uuid,order_id:'invalid'}),ValidationError);
 assert.equal(numbersInRange([1,99],100),true);
 assert.equal(numbersInRange([100],100),false);
});

test('V18.2: permisos de mínimo privilegio',()=>{
 assert.equal(canUseLab('auditor','list'),true);
 assert.equal(canUseLab('auditor','place'),false);
 assert.equal(canUseLab('auditor','release'),false);
 assert.equal(canUseLab('operator','place'),true);
 assert.equal(canUseLab('operator','expire'),false);
 assert.equal(canUseLab('admin','expire'),true);
 assert.equal(canUseLab('visitor','list'),false);
 assert.equal(isAllowedDraft({state:'draft',authorization_verified:false,total_numbers:100}),true);
 assert.equal(isAllowedDraft({state:'draft',authorization_verified:true,total_numbers:100}),false);
 assert.equal(isAllowedDraft({state:'published',authorization_verified:false,total_numbers:100}),false);
});

test('V18.2: servidor verifica identidad y rol antes de tocar pedidos',()=>{
 const getUser=edge.indexOf('auth.auth.getUser(token)');
 const role=edge.indexOf("from public.ets_staff_members");
 const raffle=edge.indexOf('from public.ets_raffles');
 const order=edge.indexOf('from ets_order_lab.orders');
 const place=edge.indexOf('ets_order_lab.place_demo_order');
 assert.ok(getUser>0 && role>getUser && raffle>role && order>raffle && place>role);
 assert.match(edge,/if\(!staff\?\.enabled\|\|!canUseLab/);
 assert.match(edge,/if\(!isAllowedDraft\(raffle\)\)/);
 assert.match(edge,/if\(!numbersInRange\(input\.numbers,raffle\.total_numbers\)\)/);
 assert.match(edge,/allowedOrigins\.has\(origin\)/);
 assert.doesNotMatch(edge,/SUPABASE_SERVICE_ROLE_KEY|process\.env\.NEXT_PUBLIC|eval\(|document\.cookie/);
});

test('V18.2: los comandos SQL apuntan solo al laboratorio privado',()=>{
 assert.match(edge,/ets_order_lab\.place_demo_order/);
 assert.match(edge,/ets_order_lab\.release_demo_order/);
 assert.match(edge,/ets_order_lab\.expire_demo_orders/);
 assert.doesNotMatch(edge,/(?:from|update|insert into|delete from)\s+public\.ets_number_allocations/i);
 assert.doesNotMatch(edge,/(?:Wompi|checkout|charge|card_number|payable_id)/i);
});

test('V18.2: cliente solo usa credenciales publicables y JWT de sesión',()=>{
 assert.match(client,/auth\.getUser\(\)/);
 assert.match(client,/auth\.getSession\(\)/);
 assert.match(client,/\bfetch\(url,/);
 assert.match(client,/authorization.*Bearer /);
 assert.match(client,/crypto\.randomUUID\(\)/);
 assert.match(client,/normalizeRequest\(/);
 assert.match(client,/mode!=='laboratorio'/);
 assert.doesNotMatch(client,/SUPABASE_SERVICE_ROLE_KEY|SUPABASE_DB_URL|\.from\('ets_order_lab/);
});

test('V18.2: interfaz identifica que no son compras',()=>{
 assert.match(html,/LABORATORIO PRIVADO/);
 assert.match(html,/NO SE VENDEN NÚMEROS/);
 assert.match(html,/no realiza cobros|no se procesan pagos|no realiza cobros con Wompi/i);
 assert.match(html,/id="create-order"[^>]*disabled/);
 assert.ok(serverRules.normalizeRequest({action:'list',raffle_id:uuid}).action==='list');
 assert.equal(serverRules.MAX_LAB_NUMBERS,MAX_LAB_NUMBERS);
});
