# V10 — Laboratorio de concurrencia de números

**Proyecto:** El toque de la suerte!  
**Estado:** probado sobre Supabase de desarrollo; **NO** constituye sistema de reserva comercial ni emisión de boletas.

## Objetivo

Ensayar la prevención de duplicados mediante restricción única de PostgreSQL y operaciones atómicas, idempotencia de solicitud, liberación por titular y vencimiento lógico de retenciones.

## Aislamiento obligatorio

- Esquema exclusivo `ets_lab`, **fuera del esquema público expuesto por la API**.
- `anon` y `authenticated` sin permisos de uso, lectura, inserción ni ejecución.
- RLS activo, sin políticas de acceso (denegación total a los usuarios cliente). Los avisos informativos `rls_enabled_no_policy` del asesor son intencionales para estas cuatro tablas.
- No se modifican `public.ets_number_allocations`, pagos, participantes, resultados ni estados de autorización.
- Sólo SQL Editor / acceso privilegiado durante el ensayo. No conectes el navegador público a estas funciones.

## Modelo

| Elemento | Función |
|---|---|
| `ets_lab.runs` | Identifica una corrida de prueba vinculada a una rifa existente |
| `ets_lab.slots` | Un registro por `(run_id, number)`; sólo se reemplaza cuando ha vencido |
| `ets_lab.requests` | Respuesta original por `(run_id, request_id)` para idempotencia |
| `ets_lab.events` | Registro de retenciones aceptadas, conflictos y liberaciones |
| `ets_lab.try_hold` | Retención atómica por 10–300 segundos, mediante `INSERT ... ON CONFLICT ... DO UPDATE` condicionado al vencimiento |
| `ets_lab.release_hold` | Libera sólo si se presenta la misma clave que tomó la retención vigente |

**Importante:** una respuesta histórica `held` de una petición idempotente **no significa que siga vigente** después de su vencimiento o liberación. Una aplicación comercial deberá comprobar el estado actual del inventario en el servidor.

## Resultados efectivamente comprobados

- Cuatro solicitudes simultáneas intentaron tomar el número 07 de una corrida temporal.
- Una obtuvo `held`, tres `conflict`.
- La restricción única mantuvo exactamente un registro de número y un titular.
- Reintentar una solicitud con el mismo identificador conservó el resultado y no duplicó la retención.
- Una clave de solicitud reutilizada para **otro número** fue rechazada.
- La liberación por una clave ajena fue rechazada; por su clave original fue aceptada.
- Tras liberación el número pudo tomarse con otra clave (en prueba transaccional con `ROLLBACK`).
- Limpieza posterior: **0 corridas, 0 retenciones**, inventario existente **0 asignaciones**, **1 rifa**, **4 fotografías** preservadas.

## Pruebas pendientes antes de cualquier uso comercial

- Carga alta y concurrencia sostenida (decenas/cientos de solicitudes, múltiples procesos) con medición de latencias y bloqueos.
- Expiración bajo desconexión y cambios de hora, reintentos de red, cancelaciones y liberación asíncrona.
- Modelo de órdenes, identificación/edad, pagos idempotentes, conciliación y emisión verificable.
- Backups y recuperación, monitoreo, auditoría protegida contra manipulación y aislamiento de ambientes.
- Revisión técnica y jurídica de los requisitos vigentes de operación de rifas en Colombia.

## Archivos

- `database/05_v10_atomic_lab.sql`: esquema completo para instalar una vez en un proyecto compatible.
- `database/06_v10_idempotency_guard.sql`: refuerzo incremental aplicado en el proyecto de pruebas; incorporado también a la versión final de la migración inicial.
- `tests/v10_sql_checks.sql`: ejemplo de pruebas bajo transacción revertida.

**Nunca ejecutes estos scripts en la base de otro negocio ni elimines datos de producción.**