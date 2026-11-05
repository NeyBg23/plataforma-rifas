// V18.2: validaciones compartidas. No guarda datos ni habilita operaciones comerciales.
export const MAX_LAB_NUMBERS = 5;
export const LAB_TTL_SECONDS = 120;
export const MAX_BODY_BYTES = 4096;
export const STAFF_WRITE_ROLES = Object.freeze(['admin','operator']);
export const STAFF_READ_ROLES = Object.freeze(['admin','operator','auditor']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function isUuid(value){return typeof value==='string'&&UUID.test(value);}
export class ValidationError extends Error{
 constructor(message){super(message);this.name='ValidationError';}
}
export function normalizeRequest(raw){
 if(!raw||Array.isArray(raw)||typeof raw!=='object')throw new ValidationError('Solicitud inválida.');
 const action=raw.action;
 if(!['list','place','release','expire'].includes(action))throw new ValidationError('Operación desconocida.');
 if(!isUuid(raw.raffle_id))throw new ValidationError('Sorteo inválido.');
 const output={action,raffle_id:raw.raffle_id};
 if(action==='place'){
  if(!isUuid(raw.request_id))throw new ValidationError('Identificador de solicitud inválido.');
  if(!Array.isArray(raw.numbers)||raw.numbers.length<1||raw.numbers.length>MAX_LAB_NUMBERS)throw new ValidationError('Selecciona entre 1 y 5 números de prueba.');
  if(raw.numbers.some(n=>!Number.isSafeInteger(n)||n<0||n>999999))throw new ValidationError('Hay números fuera de rango.');
  if(new Set(raw.numbers).size!==raw.numbers.length)throw new ValidationError('No se permiten números repetidos.');
  output.request_id=raw.request_id;
  output.numbers=[...raw.numbers].sort((a,b)=>a-b);
 }
 if(action==='release'){
  if(!isUuid(raw.order_id))throw new ValidationError('Pedido de prueba inválido.');
  output.order_id=raw.order_id;
 }
 return output;
}
export function canUseLab(role,action){
 return STAFF_READ_ROLES.includes(role)&&
  (action==='list'||(action==='expire'&&role==='admin')||(STAFF_WRITE_ROLES.includes(role)&&['place','release'].includes(action)));
}
export function isAllowedDraft(row){
 return !!row&&row.state==='draft'&&row.authorization_verified===false&&
  Number.isSafeInteger(row.total_numbers)&&row.total_numbers>=10&&row.total_numbers<=1000000;
}
export function numbersInRange(numbers,total){
 return Array.isArray(numbers)&&numbers.every(n=>n>=0&&n<total);
}
