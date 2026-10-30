# El toque de la suerte! — corrección V8.1

**Estado:** plataforma de desarrollo sin ventas reales, boletas ni publicación de rifas.

## Problema corregido

Al enviar una rifa a **En revisión**, la V8 dejaba los campos de la ficha y la galería en modo lectura, sin una acción visible para corregirlos. La V8.1 incorpora la opción **↶ Volver a borrador**:

- En el listado **Mis rifas**, junto a las rifas en revisión.
- Dentro de **Premio y fotos**, cuando la edición está bloqueada por revisión.

Confirma la operación antes de realizarla; solo disponible para roles habilitados de edición (`admin` u `operator`), rifas en `in_review` o `awaiting_authorization`, y sin autorización verificada. Quedan excluidas las rifas publicadas, canceladas y finalizadas.

La aplicación realiza una actualización condicional a `draft` a través de Supabase Auth y RLS. El trigger de auditoría registra el cambio de estado con el usuario de la sesión; se conservan fotos, fichas y la rifa original. Al regresar a borrador, puedes editar el premio y volver a enviarlo a revisión cuando termines.

## Uso

1. Abre [el administrador](https://neybg23.github.io/plataforma-rifas/admin/).
2. Selecciona **Mis rifas** y abre **Premio y fotos** para la rifa que dice *En revisión*.
3. Pulsa **↶ Volver a borrador para editar** y confirma.
4. Completa o corrige la ficha y añade las fotografías necesarias.
5. Guarda. Si quieres, vuelve a **Mis rifas → Enviar a revisión**.
6. En **Historial** aparecerá la transición `En revisión → Borrador`.

## Seguridad y alcance

- No hay cambios de SQL, políticas RLS ni tablas; se usan los permisos existentes de la V7/V8.
- No se revierte una rifa publicada ni se permite editar premios de rifas publicadas.
- No se emplean secretos de Supabase; las claves privadas nunca van al repositorio.
- El flujo comercial, el inventario transaccional y los pagos continúan desactivados.

## Validación

Pruebas de interfaz automatizadas en viewport de escritorio de 1440 px y móvil de 390 px: retorno desde la ficha, desbloqueo del formulario, guardado del premio, auditoría, envío de nuevo a revisión y retorno desde el listado. Ejecuta las pruebas locales con Playwright donde esté disponible.