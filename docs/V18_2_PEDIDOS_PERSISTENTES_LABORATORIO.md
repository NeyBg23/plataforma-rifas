# V18.2 — Pedidos persistentes de laboratorio (NO comerciales)

## Estado comprobado al 5 de noviembre de 2026

- Supabase Edge Function `ets-orders-lab` desplegada en el proyecto `ncbdkllujiakleuhdhhr`, versión 1, `ACTIVE` y `verify_jwt=true`.
- Pantalla en `/admin/pedidos-lab.html?rifa=UUID`; acceso desde **Mis sorteos → Pedidos de prueba**, solo para borradores.
- Vercel: 65 pruebas automatizadas superadas; despliegue `READY`.
- Postgres: pruebas de creación, conflicto, replay y liberación ejecutadas en transacción con `ROLLBACK`, sin órdenes persistentes.
- La primera prueba extremo a extremo (navegador autenticado → Edge Function → conexión PostgreSQL → tabla) sigue **pendiente**. No declarar ventas, pagos ni retenciones reales habilitados.

## Arquitectura y controles

```
Administrador autenticado (Supabase Auth)
  → vista laboratorio V18.2 (clave publicable)
  → Edge Function ets-orders-lab (JWT verificado, CORS restringido, verificación Auth)
  → rol activo de ets_staff_members consultado en servidor
  → borrador no autorizado, límite 5 números, idempotencia UUID
  → ets_order_lab (funciones SECURITY INVOKER privadas)
```

- Roles: administrador crea/libera/expira y consulta; operador crea/libera y consulta; auditor solo consulta.
- Retenciones de laboratorio: 120 segundos, sin asignaciones comerciales ni efectos en `public.ets_number_allocations`.
- El cliente no envía credenciales secretas, únicamente el JWT de su sesión a la función.
- SQL ejecutado con consultas parametrizadas y sin interpolar cadenas del usuario.
- No usar el laboratorio como motor definitivo de venta ni habilitar Wompi en esta etapa.

## Prueba pendiente en el navegador

1. Iniciar sesión en `https://el-toque-de-la-suerte.vercel.app/admin/`.
2. Ir a **Mis sorteos → Pedidos de prueba** en la rifa borrador.
3. Confirmar que se ve `Conectado a Supabase`. Si aparece error de configuración o 401/403/500, no forzar y revisar las funciones/logs.
4. Seleccionar dos números, crear pedido y confirmar que aparece en historial con vencimiento.
5. Desde otra pestaña o sesión autorizada, intentar los mismos números: debe devolver conflicto.
6. Reintentar con la misma clave de idempotencia, liberar, verificar vencimiento y trazabilidad.
7. Verificar que `ets_number_allocations` permanece en cero y que no hay cobros, pedidos de clientes o boletas.

## Antes de cualquier producción comercial

Validar formalmente autorización del operador y de cada rifa, infraestructura certificable, pruebas de concurrencia reales, rate-limiting, observabilidad, rollback, protección de identidades y datos personales, plan de backups, habilitación de plan comercial del alojamiento y onboarding/condiciones de Wompi. Las credenciales de Wompi son exclusivas del servidor y la conciliación debe proceder de notificaciones autenticadas, no del navegador.
