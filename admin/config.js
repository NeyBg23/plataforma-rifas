// CONFIGURACIÓN PÚBLICA. Solo URL del proyecto y clave publicable (sb_publishable_...).
// NO colocar service_role, sb_secret_, contraseñas ni tokens privados.
// Hasta configurar una base aislada, la consola permanecerá bloqueada (sin datos reales).
window.ETS_PUBLIC_SUPABASE = Object.freeze({
  url: '',
  publishableKey: ''
});