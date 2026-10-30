import test from 'node:test';
import assert from 'node:assert/strict';
import {formatNumber,normalizeNumbers,calculateTotal,createDemoOrder,saveOrder,loadOrders,findOrder,STORAGE_KEY} from '../experiencia/demo-domain.mjs';
const raffle={id:'moto',name:'Motocicleta de prueba',price:25000,total:100};
const now='2026-10-30T20:00:00.000Z';
const mockStorage=()=>{const db=new Map();return {getItem:key=>db.has(key)?db.get(key):null,setItem:(key,value)=>db.set(key,value)}};
const create=(values=[5,2])=>createDemoOrder({raffle,selected:values,reference:'DEMO-ABC12345',now});

test('numera con ceros y ordena correctamente',()=>{assert.equal(formatNumber(5,100),'05');assert.equal(formatNumber(5,10000),'0005');assert.deepEqual(normalizeNumbers([5,2],100),[2,5]);});
test('rechaza números duplicados, rangos y listas excesivas',()=>{assert.throws(()=>normalizeNumbers([3,3],100),/repetir/);assert.throws(()=>normalizeNumbers([100],100),/rango/);assert.throws(()=>normalizeNumbers([-1],100),/rango/);assert.throws(()=>normalizeNumbers([],100),/Selecciona/);assert.throws(()=>normalizeNumbers([0,1,2,3,4,5],100),/Selecciona/);});
test('calcula montos en pesos sin flotantes',()=>{assert.equal(calculateTotal(25000,[2,5]),50000);assert.throws(()=>calculateTotal(1.2,[2]),/Precio/);});
test('crea referencia local con estado de demostración',()=>{const order=create();assert.equal(order.status,'demo_created');assert.equal(order.totalCOP,50000);assert.deepEqual(order.numbers,[2,5]);assert.equal(order.events.length,3);});
test('idempotencia en almacenamiento local no crea duplicados',()=>{const storage=mockStorage();saveOrder(storage,create());saveOrder(storage,create());assert.equal(loadOrders(storage).length,1);assert.equal(findOrder(storage,' demo-abc12345 ').totalCOP,50000);});
test('no reutiliza una referencia con números diferentes',()=>{const storage=mockStorage();saveOrder(storage,create());assert.throws(()=>saveOrder(storage,create([9])),/reutilizada/);});
test('limita historial local y filtra entradas inválidas',()=>{const storage=mockStorage();storage.setItem(STORAGE_KEY,'{bad');assert.equal(loadOrders(storage).length,0);storage.setItem(STORAGE_KEY,JSON.stringify([{schemaVersion:1,reference:'evil',status:'fake'}]));assert.equal(loadOrders(storage).length,0);});
test('rechaza referencias inválidas',()=>{assert.throws(()=>createDemoOrder({raffle,selected:[1],reference:'ETD-REAL-001',now}),/Referencia/);});