# Activación del primer administrador — El Toque de la Suerte

## Proyecto exclusivo de desarrollo

- Supabase: `ncbdkllujiakleuhdhhr`
- URL pública: `https://ncbdkllujiakleuhdhhr.supabase.co`
- Organización: `Neybg23`
- Región: `us-east-1` (Estados Unidos). **No usar como infraestructura definitiva regulada hasta validar residencia de datos, certificación y requisitos de operación en Colombia.**
- Migración aplicada: `ets_v7_core_schema`
- Sitio: `https://neybg23.github.io/plataforma-rifas/admin/`

## Estado actual

La base cuenta con cuatro tablas, RLS activado, siete políticas y cero usuarios de personal. **No hay ventas, pagos, reservas, boletas ni autorizaciones comerciales.** No uses datos personales reales en pruebas.

## Alta del administrador (acción manual autorizada)

1. Abre el proyecto en [Supabase](https://supabase.com/dashboard/project/ncbdkllujiakleuhdhhr).
2. Ve a **Authentication → Users** y crea/invita la cuenta administrativa de una persona autorizada con su propio correo. No compartas su contraseña ni utilices contraseñas de ejemplo.
3. Confirma el usuario según la configuración de Authentication y **copia únicamente el UID** que aparece en la ficha de ese usuario.
4. Desde **SQL Editor** del proyecto **El Toque de la Suerte** (no de otra aplicación), ejecuta después de sustituir el UID por el real:

```sql
insert into public.ets_staff_members (user_id, role, enabled)
values ('UID-VALIDO-DEL-USUARIO'::uuid, 'admin', true)
on conflict (user_id) do update
set role = excluded.role,
    enabled = excluded.enabled;
```

5. Entra a la URL pública del administrador con el correo y contraseña de esa cuenta.
6. Comprueba que puedes crear un **borrador interno**, editarlo y revisar el registro de auditoría. No intentes publicar o vender una rifa.

## Seguridad

- La URL y la clave `sb_publishable_...` de `admin/config.js` son públicas por diseño. **Nunca se deben poner claves `sb_secret_`, `service_role`, contraseñas o cadenas de conexión privadas en GitHub.**
- El panel rechaza usuarios sin un registro activo en `ets_staff_members`.
- Los permisos del servidor se controlan con RLS y privilegios SQL.
- No hay registro comercial ni cobro de dinero.
- El alojamiento de GitHub Pages es público: **no equivale a un portal privado por sí solo**. El servidor valida las operaciones.
- La infraestructura actual es para desarrollo y pruebas, no para afirmar cumplimiento regulatorio.

## Siguiente fase

Aplicar pruebas de integración con una cuenta administradora real y otra sin permisos; incorporar CI de seguridad, recuperación de sesión, mejoras de accesibilidad y preparar el modelo transaccional de reservas sin habilitarlo.
