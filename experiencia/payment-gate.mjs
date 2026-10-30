/** Preparación de un proveedor de pagos. SIN operaciones de cobro.
 * El permiso comercial y las validaciones se implementarán en el servidor.
 * Esta definición es descriptiva; nunca puede activar pagos por sí misma.
 */
export const paymentProvider = Object.freeze({
  id: 'wompi', name: 'Wompi', country: 'CO', currency: 'COP',
  phase: 'planned', checkoutEnabled: false, environment: 'none',
  requiresMerchantApproval: true,
});

export const PAYMENT_REQUIREMENTS = Object.freeze([
  'Verificar autorización de operación y permisos específicos de cada rifa.',
  'Confirmar que Wompi admite formalmente la actividad y habilitar el comercio.',
  'Crear pedidos e inventario con operaciones atómicas, vencimientos e idempotencia.',
  'Generar referencia única y firma de integridad exclusivamente en el servidor.',
  'Verificar autenticidad de webhooks y conciliar eventos de manera idempotente.',
  'Emitir la confirmación únicamente después de validar el pago en el backend.',
]);
export function paymentReadiness() {
  return {provider: paymentProvider, status:'disabled', requirements: [...PAYMENT_REQUIREMENTS]};
}
// Fail-closed: la vista de demostración siempre rechaza cualquier intento de cobro.
export function beginPayment(){
  throw new Error('Pagos desactivados: no existe checkout comercial autorizado.');
}