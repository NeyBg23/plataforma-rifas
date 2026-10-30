# V9 · Control de números (solo lectura)

Proyecto: **El toque de la suerte!** — rama `main` de `NeyBg23/plataforma-rifas`.

## Qué habilita

- En **Mis rifas**, cada registro tiene una acción **Números**.
- Muestra la numeración de prueba, empezando por 0 y terminando en `total_numbers - 1` (por ejemplo, 100 números se muestran `00`–`99`). Este formato es una **convención provisional**, no una emisión aprobada.
- Consulta la tabla real `public.ets_number_allocations` con la sesión autorizada del administrador; no inventa registros.
- Diferencia: *sin registro*, *retenido*, *emitido* y *anulado*; muestra recuentos y un buscador de números.
- Renderiza 100 números por página incluso para emisiones configuradas de 1.000.000, evitando sobrecargar el navegador.
- Ofrece un acceso directo a la ficha del premio para completar sus datos.
- Conserva el tema negro/naranja neón/dorado y el tema claro.

## Seguridad y alcances

- **No existe un botón de reservar, asignar, liberar, vender o emitir números.** La consulta no crea ni modifica registros.
- Los números **sin registro en el inventario no equivalen a números comercialmente disponibles**. Antes de habilitar operaciones habrá que implementar autorizaciones, transacciones atómicas, expiración de reservas, comprobantes y conciliación de pagos.
- La tabla tiene RLS y lectura solo para personal habilitado. La API de usuario autenticado **no dispone de permisos INSERT ni UPDATE**.
- La clave primaria `(raffle_id, number)` evita que haya dos registros con el mismo número por rifa, pero **no resuelve por sí sola** el ciclo de vida de reserva/venta.
- La página pública sigue en demostración, sin pagos ni boletas oficiales.
- La región actual de Supabase es para desarrollo; no equivale a validación de los requisitos regulatorios de infraestructura en Colombia.

## Estado real verificado antes de desplegar V9

- 1 rifa de prueba registrada en Supabase.
- 4 archivos de fotografía en el almacenamiento privado.
- 0 fichas escritas de premio en `ets_prizes` (pendiente de completar con los campos de la ficha).
- 0 asignaciones de números en `ets_number_allocations`.

## Prueba manual recomendada

1. Abre `https://neybg23.github.io/plataforma-rifas/admin/`, inicia sesión y entra a **Mis rifas → Números**.
2. En la rifa de prueba con 100 números, verifica que aparezcan `00` a `99` y 100 números **sin asignación registrada**.
3. Busca `07` y comprueba que se destaque sin cambiar su estado.
4. Alterna oscuro/claro y verifica la legibilidad.
5. Pulsa **Completar ficha del premio** y guarda las características escritas.
6. Verifica que **no haya forma de asignar, vender o reservar** desde este módulo.

## Próxima fase

Diseñar el inventario transaccional con garantías de integridad, validación del rango de cada emisión, control de expiraciones, idempotencia, auditoría y pruebas concurrentes; no activar esas operaciones hasta contar con autorizaciones y verificaciones técnicas aplicables.