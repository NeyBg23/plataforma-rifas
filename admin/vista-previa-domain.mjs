/** Funciones puras para la vista previa privada: sin escrituras y sin autorización comercial. */
export function isRaffleId(value){return typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);}
export function pickPreviewInfo(row){
  if(!row||!isRaffleId(row.id)||typeof row.title!=='string'||row.title.trim().length<3)return null;
  if(!Number.isSafeInteger(row.ticket_price_cop)||row.ticket_price_cop<1||!Number.isSafeInteger(row.total_numbers)||row.total_numbers<10||row.total_numbers>1000000)return null;
  return {title:row.title.trim().slice(0,140),description:typeof row.description==='string'?row.description.slice(0,3000):'',category:typeof row.category==='string'?row.category:'Premio',draw_at:row.draw_at,state:row.state,ticket_price_cop:row.ticket_price_cop,total_numbers:row.total_numbers};
}
export function formatNumber(number,total){if(!Number.isSafeInteger(number)||number<0||!Number.isSafeInteger(total)||total<=0||number>=total)throw new RangeError('Número fuera de rango');return String(number).padStart(String(total-1).length,'0');}
export function formatCOP(value){return new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(value||0);}
export function imageUrlIsPrivate(value,base){
  try{
    const url=new URL(value,base),origin=new URL(base);
    return url.protocol==='https:'&&url.origin===origin.origin&&url.pathname.startsWith('/storage/v1/object/sign/ets-prize-drafts/')&&url.searchParams.has('token');
  }catch{return false;}
}