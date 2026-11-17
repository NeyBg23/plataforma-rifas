const configuration = window.ETS_PUBLIC_SUPABASE || {};

export function authClient() {
  if (!window.supabase?.createClient) throw new Error('No se pudo cargar el acceso al panel. Actualiza la página.');
  return window.supabase.createClient(configuration.url,configuration.publishableKey,{
    auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}
  });
}
export async function paymentRequest(payload,client = null) {
  const headers = {'content-type':'application/json','apikey':configuration.publishableKey};
  if (client) {
    const {data,error} = await client.auth.getSession();
    if (error || !data?.session?.access_token) throw new Error('Inicia sesión en el administrador de este mismo dominio.');
    headers.authorization = 'Bearer ' + data.session.access_token;
  }
  const response = await fetch(new URL('/functions/v1/ets-manual-payments',configuration.url),{
    method:'POST',headers,body:JSON.stringify(payload),cache:'no-store'
  });
  let result;
  try { result = await response.json(); }
  catch { throw new Error('El servidor no respondió. Puedes volver a intentar.'); }
  if (!response.ok || !result?.ok) {
    const error = new Error(result?.error || 'No se pudo completar la operación.');
    error.status = response.status;
    error.conflict = result?.outcome === 'conflict';
    throw error;
  }
  return result;
}
export const money = value => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(Number(value));
export const numberLabel = (value,total) => String(value).padStart(String(total-1).length,'0');
export const dateLabel = value => new Date(value).toLocaleString('es-CO',{timeZone:'America/Bogota'});
export const states = {
  awaiting_payment:'Pendiente de transferencia',pending_review:'Pago por revisar',
  confirmed:'Confirmado',rejected:'Rechazado',expired:'Vencido'
};
export function node(tag,text,className) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
}
export function showQr(image,url) {
  image.hidden = true;
  image.removeAttribute('src');
  if (!url) return;
  const parsed = new URL(url,configuration.url);
  if (parsed.origin !== new URL(configuration.url).origin ||
    !parsed.pathname.startsWith('/storage/v1/object/sign/ets-payment-qr/')) throw new Error('Imagen QR no verificada.');
  image.src = parsed.href;
  image.hidden = false;
}
export function setupTheme(button) {
  function apply(value) {
    document.body.dataset.theme = value === 'light' ? 'light' : 'dark';
    button.textContent = document.body.dataset.theme === 'dark' ? '☀ Tema claro' : '☾ Tema oscuro';
    try { localStorage.setItem('ets-site-theme',document.body.dataset.theme); } catch {}
  }
  try { apply(localStorage.getItem('ets-site-theme')); } catch { apply('dark'); }
  button.addEventListener('click',() => apply(document.body.dataset.theme === 'dark' ? 'light' : 'dark'));
}
