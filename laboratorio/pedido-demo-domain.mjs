/** V18.1: laboratorio puro en memoria. Nunca crea pedidos comerciales. */
export const MAX_SELECTION = 5;
export const HOLD_MS = 120_000;
export function normalizeNumbers(numbers, total) {
  if (!Array.isArray(numbers) || !Number.isSafeInteger(total) || total < 10 || total > 10000 || numbers.length < 1 || numbers.length > MAX_SELECTION) throw new RangeError('Selecciona entre 1 y 5 números válidos.');
  if (!numbers.every(n => Number.isSafeInteger(n) && n >= 0 && n < total) || new Set(numbers).size !== numbers.length) throw new RangeError('Número inválido o repetido.');
  return [...numbers].sort((a,b)=>a-b);
}
export function parseDemoParams(search) {
  const qs = new URLSearchParams(search);
  const totalRaw=qs.get('total'), priceRaw=qs.get('price');
  const total=totalRaw && /^\d{2,5}$/.test(totalRaw) ? Number(totalRaw) : 100;
  const price=priceRaw && /^\d{3,8}$/.test(priceRaw) ? Number(priceRaw) : 20000;
  if (!Number.isSafeInteger(total) || total<10 || total>10000 || !Number.isSafeInteger(price) || price<1000 || price>10000000) throw new RangeError('Parámetros fuera de rango.');
  const str=qs.get('numbers');
  let numbers=[];
  if(str !== null && str !== ''){
    if(!/^\d{1,5}(,\d{1,5}){0,4}$/.test(str)) throw new RangeError('Selección inválida.');
    numbers=normalizeNumbers(str.split(',').map(Number),total);
  }
  return {total,price,numbers};
}
export function newDemoState(total=100, price=20000) {
  if(!Number.isSafeInteger(total)||total<10||total>10000||!Number.isSafeInteger(price)||price<1000||price>10000000)throw new RangeError('Configuración inválida');
  return {total,price,orders:[]};
}
export function orderStatus(order, now) {
  return order.state==='held'&&now>=order.expiresAt?'expired':order.state;
}
export function placeDemoOrder(lab, numbers, requestId, now=Date.now()) {
  const chosen=normalizeNumbers(numbers,lab.total);
  if(typeof requestId!=='string'||!/^[A-Za-z0-9_-]{8,80}$/.test(requestId))throw new TypeError('Clave de solicitud inválida.');
  const previous=lab.orders.find(o=>o.requestId===requestId);
  if(previous){
    if(previous.numbers.join(',')!==chosen.join(','))throw new Error('Clave usada con otra selección.');
    return {outcome:'replay',order:previous};
  }
  const occupied=lab.orders.some(o=>orderStatus(o,now)==='held'&&chosen.some(n=>o.numbers.includes(n)));
  if(occupied)return {outcome:'conflict',order:null};
  const order={requestId,numbers:chosen,state:'held',createdAt:now,expiresAt:now+HOLD_MS};
  lab.orders.push(order);
  return {outcome:'created',order};
}
export function releaseDemoOrder(lab,requestId,now=Date.now()) {
  const order=lab.orders.find(o=>o.requestId===requestId);
  if(!order||orderStatus(order,now)!=='held')return false;
  order.state='released';return true;
}
export function heldNumbers(lab,now=Date.now()){
  return new Set(lab.orders.filter(o=>orderStatus(o,now)==='held').flatMap(o=>o.numbers));
}