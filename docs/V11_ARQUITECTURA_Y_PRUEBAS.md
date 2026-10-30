# V11 — arquitectura de experiencia y laboratorio de pedidos

**Alcance:** laboratorio tecnológico separado de la operación comercial. No recibe datos personales, no cobra pagos y no asigna boletas. La página pública existente (`/`) y el administrador (`/admin/`) no se sustituyen en esta entrega.

## Componentes

```text
GitHub Pages
  /experiencia/  → Catálogo ficticio, selector demo, resumen y referencia local
     catalog.mjs      → premios de ejemplo
     demo-domain.mjs  → reglas, totales, contrato, persistencia local
     app.mjs          → navegación y UI

Supabase (esquema privado NO expuesto: ets_order_lab)
  orders    → estado held_demo/released_demo/expired_demo
  slots     → unicidad (raffle_id, number)
  attempts  → intentos aceptados, conflictos, reintentos
  events    → auditoría de ciclo de vida
  funciones SECURITY INVOKER → create/release/expire simulados, solo rol privilegiado

Inventario comercial: public.ets_number_allocations (NO MODIFICADO)
```

## Contratos y reglas

- Máximo cinco números por selección; se ordenan y deduplicación es **rechazo**, no normalización silenciosa.
- Numeración de ejemplo 0 a N-1 con ceros a la izquierda, sin indicar disponibilidad real.
- La interfaz almacena referencias `DEMO-XXXXXXXX` en `localStorage`, **no** en PostgreSQL. Su historial es solo una representación local que puede perderse.
- La creación real de pedidos no usa el navegador como fuente de verdad: se necesitará servicio autenticado, clave de idempotencia, reserva con vencimiento y conciliación con proveedor de pagos.
- La función SQL privada adquiere bloqueos en orden determinista y escribe toda la selección en una misma transacción. No deja adjudicaciones parciales ante conflictos.
- Claves de solicitud **aceptadas** siempre devuelven el mismo identificador. Intentos rechazados no generan pedido: pueden intentar nuevamente después de que el conflicto desaparezca (esta política requiere definición final antes de producción).
- Vencimiento por cron de mantenimiento está **inactivo**: solo existe función manual.

## Verificaciones realizadas

- 8 pruebas de lógica con `node --test`.
- 2 recorridos Chromium aislados, 1440 px y 390 px: selección → resumen → referencia demo → consulta, cambio de tema.
- Test SQL reversible con transacción y `ROLLBACK`: aceptación de dos números, conflicto de selección superpuesta, replay y liberación.
- No se han probado múltiples conexiones SQL concurrentes para pedidos V11 ni se ha simulado caída de proveedor de pagos.

## Limitaciones críticas y controles pendientes

1. Separar proyectos de desarrollo, QA y producción. La base Supabase actual es exclusivamente de desarrollo.
2. Definir modelo de comprador, consentimiento y tratamiento de datos antes de guardar identidad.
3. Arquitectura del servicio seguro (Edge Function u otro backend) con MFA y autorizaciones de operación.
4. Perfiles de gestor, operador, auditor y usuarios, segregación de funciones y controles de cambios.
5. Validar permisos RLS, cifrado, backup restaurable, trazabilidad resistente a manipulación y monitoreo.
6. Pruebas reales de 100+ solicitudes simultáneas, bloqueos, vencimiento y recuperación.
7. Diseño de órdenes y pagos con webhooks idempotentes, devoluciones, conciliación y prevención de doble emisión.
8. Validación regulatoria y de infraestructura antes de exposición comercial.

## Uso

`node --test tests/v11_domain.test.mjs`

`python tests/test_v11_browser.py` (Chromium y Playwright instalados; prueba aislada DOM).

Aplicar `database/07_v11_private_orders_lab.sql` **solo en el proyecto Supabase indicado** si aún no aparece en historial. Nunca publicar funciones `ets_order_lab` a `anon` o `authenticated`.