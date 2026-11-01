# El toque de la suerte! — V9

Plataforma de rifas **en desarrollo** con una experiencia pública de demostración y un administrador conectado a un proyecto independiente de Supabase.

**No cuenta con autorización para comercializar rifas. No procesa pagos, no emite boletas y no permite reservar, vender ni asignar números desde el navegador.** Las rifas que aparecen en el catálogo público son ejemplos ficticios.

## Acceso

- [Página pública (V6)](https://neybg23.github.io/plataforma-rifas/) — simulación sin ventas.
- [Administrador (V9)](https://neybg23.github.io/plataforma-rifas/admin/) — autenticación real con rol de personal autorizado.
- [Base de datos Supabase](https://supabase.com/dashboard/project/ncbdkllujiakleuhdhhr) — exclusiva para este proyecto, actualmente utilizada para desarrollo.

## Componentes

| Componente | Estado |
| --- | --- |
| Portal público oscuro/claro | Demo V6 |
| Login y roles con Supabase Auth | Conectados |
| Creación/edición/revisión de borradores | Conectados a PostgreSQL |
| Historial de cambios | Registrado mediante triggers |
| Ficha del premio | V8 · edición de borradores |
| Fotografías | V8 · Storage privado, hasta 8 por rifa |
| Volver de revisión a borrador | V8.1 |
| **Inventario numérico** | **V9 · consulta paginada, lectura exclusiva** |
| Reservas, compra, pago, emisión | Desactivados |

## V9: control interno de números

En **Mis rifas → ▦ Números**, el personal autorizado puede consultar el rango numérico definido para cada rifa. Se muestran 100 números por página, búsqueda por número, conteos desde Supabase y estados de registros internos.

**Sin registro no significa disponible para venta.** Las operaciones transaccionales, garantías contra duplicados, autorizaciones y conciliación se implementarán y verificarán antes de cualquier uso comercial.

Consulta [documentación y prueba manual V9](docs/V9_CONTROL_NUMEROS.md).

## Seguridad

- Base de datos separada de las otras aplicaciones de la organización `Neybg23`.
- RLS habilitado; solo personal autorizado puede consultar el inventario de números.
- El frontend no tiene permisos para insertar ni modificar asignaciones de números.
- Las fotos de borradores residen en un bucket privado, no en el sitio público.
- Solo se publica una clave Supabase `sb_publishable_...` destinada al cliente; nunca claves secretas.
- GitHub Pages es público: los permisos se aplican **en el servidor**.
- La infraestructura actual es de desarrollo y no supone certificación ni cumplimiento regulatorio.

## Desarrollo y pruebas

```bash
python -m http.server 8000
node --check admin/app.js
```

Test de V9 (requiere Playwright y Chromium instalados): `python tests/test_numbers_browser.py`.

## Documentos técnicos

- [Arquitectura V7](docs/DECISIONES_V7.md)
- [Primer administrador](docs/PRIMER_ADMINISTRADOR_SUPABASE.md)
- [Premios y fotografías V8](docs/V8_PREMIOS_Y_FOTOS.md)
- [Recuperación de revisión V8.1](docs/V8_1_CORRECCION_REVISION.md)
- [Inventario en consulta V9](docs/V9_CONTROL_NUMEROS.md)

La puesta en operación comercial requiere un sistema transaccional validado, controles de datos personales, infraestructura apropiada, pruebas de concurrencia y evaluación legal y técnica de las autorizaciones exigibles.

## V10 — motor transaccional (laboratorio cerrado)

Se aplicó un **laboratorio PostgreSQL privado**, en el esquema `ets_lab`, para probar retenciones atómicas, conflictos entre solicitudes simultáneas, idempotencia, liberación y trazabilidad. Se probaron cuatro solicitudes simultáneas: **1 aceptada, 3 conflictos**, con un único titular. Los datos temporales fueron limpiados.

**No es funcionalidad de venta ni reserva pública.** No cambia el inventario V9 ni habilita números, pagos o boletas. La página pública y el administrador no llaman funciones del laboratorio.

- [Diseño, pruebas y límites de V10](docs/V10_MOTOR_TRANSACCIONAL_LAB.md)
- [Migración SQL V10](database/05_v10_atomic_lab.sql)
- [Refuerzo de idempotencia](database/06_v10_idempotency_guard.sql)
- [Prueba SQL reversible](tests/v10_sql_checks.sql)

## V11 — experiencia guiada de cliente + laboratorio de pedidos

Nueva ruta independiente **[/experiencia/](https://neybg23.github.io/plataforma-rifas/experiencia/)** con catálogo ficticio, selector de hasta 5 números de ejemplo, revisión de resumen, referencia local `DEMO-XXXXXXXX`, trazabilidad visual y temas claro/oscuro. **No hay pagos, datos personales reales ni reservas.** El historial en navegador no constituye registro oficial de compra.

En Supabase, el esquema privado `ets_order_lab` incluye pedidos de laboratorio, slots únicos, intentos auditados y vencimientos manuales. No se ha conectado ni expuesto al público. Las asignaciones comerciales permanecen inactivas.

- [Arquitectura, límites y controles pendientes](docs/V11_ARQUITECTURA_Y_PRUEBAS.md)
- [Código frontend](experiencia/)
- [Migración privada de laboratorio](database/07_v11_private_orders_lab.sql)
- [Pruebas de lógica](tests/v11_domain.test.mjs)
- [Prueba SQL reversible](tests/v11_sql_reversible.sql)

## V12.1 — despliegues automáticos

Cambio de integración para verificar el flujo GitHub → Vercel. El proyecto sigue siendo de desarrollo, sin pagos ni emisión comercial. El frontend de V12.1 mostrará únicamente datos autorizados por Supabase Auth y RLS.

## V12.1 — consola autenticada de solo lectura

La ruta [laboratorio](https://el-toque-de-la-suerte.vercel.app/laboratorio/) requiere iniciar sesión mediante el administrador en el **mismo dominio**. Antes de consultar datos verifica la sesión real de Supabase Auth y el rol del personal. Las consultas se hacen mediante RLS a `ets_raffles`, `ets_number_allocations` y `ets_raffle_audit`; no se expone el esquema privado de pedidos.

- No permite crear pedidos, retener números, cobrar ni emitir boletas.
- Usuarios anónimos o sin rol de personal activo no ven métricas internas.
- [Arquitectura, pruebas y pendientes](docs/V12_1_CONSOLA_Y_DESPLIEGUE.md).
- Ejecuta `npm test` para pruebas de dominio y de permisos simulados.
- Vercel está conectado al repositorio; los cambios en `main` se despliegan automáticamente. Se usa una lista blanca de archivos públicos.

## V13 — presentación de prelanzamiento y Wompi previsto

La página principal redirige a [la experiencia pública unificada](https://el-toque-de-la-suerte.vercel.app/experiencia/) con diseño oscuro/claro, catálogo ficticio, selección ilustrativa y consulta local de simulaciones. Los pagos disponen de una nueva ruta `#/pagos` y de un espacio de Wompi dentro del resumen.

**Wompi NO está integrado ni autorizado**: no hay checkout activo, credenciales, creación de cobros, reservas comerciales, boletas ni webhooks. La función de pago rechaza cualquier intento; el frontend jamás crea transacciones reales. El nombre se muestra como *proveedor previsto*, sujeto a autorización legal, revisión y aprobación comercial por Wompi.

- [Diseño, arquitectura y requisitos de integración](docs/V13_PRELANZAMIENTO_WOMPI.md)
- [Pruebas de seguridad de pasarela deshabilitada](tests/test_v13_payment.mjs)
- `npm test`: dominio, autorización de laboratorio y bloqueo de pagos.
- `npm run build`: obliga a pasar pruebas y solo publica archivos permitidos en `dist/`.

**El repositorio es público y el sitio es de desarrollo.** Antes de un lanzamiento real faltan validación del operador y de cada rifa, controles regulatorios, pruebas de concurrencia/seguridad/ciberseguridad, infraestructura certificable, onboarding del procesador de pagos y validación de webhooks.

## V14 — portada pública real y catálogo con RLS

- La dirección raíz `/` ya no redirige al simulador; contiene una portada independiente responsive con temas oscuro y claro, secciones de información y una zona de catálogo.
- El catálogo consulta **solo por lectura** `public.ets_raffles` en Supabase mediante clave publicable. La política RLS limita el acceso a rifas publicadas, con autorización verificada y fecha de sorteo. Mientras no existan campañas así habilitadas, se presenta un estado vacío honesto.
- La simulación ficticia permanece en `/experiencia/`, separada de las campañas reales.
- Wompi continúa señalado como proveedor **previsto y desactivado**. No hay cobros, reservas ni emisión de boletas.
- El sistema de compilación verifica pruebas V11-V14 y publica una lista blanca de archivos estáticos; nunca incluye SQL ni credenciales privadas.

[Arquitectura V14 y hoja de ruta V15-V18](docs/V14_PORTADA_PUBLICA_Y_PROXIMOS_PASOS.md).
