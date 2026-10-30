# El toque de la suerte! · V7

Plataforma de rifas en fase de **desarrollo tecnológico**. Portada pública V6 conservada y nuevo **panel administrativo V7** separado, con diseño negro/naranja neón y tema claro/oscuro.

> **Importante:** No existe autorización comercial de Coljuegos asociada a este prototipo. Los premios, porcentajes, selecciones y referencias del sitio público son demostrativos. **No se procesan pagos ni se emiten, reservan o venden números reales.**

## Ver la web

- Sitio público: `index.html` (GitHub Pages, raíz).
- Panel V7: `admin/index.html` (ruta `/admin/`).
- Base de datos: `database/01_core_schema.sql` (diseño preparado, aún no aplicado).
- Consultas de revisión: `database/02_security_checks.sql`.

Para ver el código estático localmente:

```bash
python -m http.server 8000
```

Visita `http://localhost:8000/` y `http://localhost:8000/admin/`. El administrador indicará **“base de datos aún no conectada”** hasta configurar un proyecto Supabase exclusivo.

## Arquitectura V7

| Componente | Estado | Seguridad |
|---|---|---|
| Catálogo público V6 | Demo funcional | Datos ficticios en JS, sin ventas |
| Login admin V7 | Implementado, pendiente de servicio | Supabase Auth y verificación real de rol |
| Gestión de borradores | Implementada, pendiente de servicio | INSERT/UPDATE según rol + RLS |
| Auditoría de cambios | Esquema y vista preparados | Trigger en Postgres, lectura autorizada |
| Inventario numerado | Restricción SQL preparada | Clave `(raffle_id, number)`, sin escrituras cliente |
| Pagos, asignación, publicación | Bloqueados | Requerirán servicios, controles y autorización |

## Conectar una base de datos dedicada (tarea pendiente)

**No uses bases de datos de otros proyectos.** Antes de pasar datos reales:

1. Crea un proyecto Supabase dedicado a **El toque de la suerte!**. La creación puede requerir elegir organización y plan.
2. En SQL Editor del proyecto nuevo, revisa y ejecuta `database/01_core_schema.sql`. Verifica con `database/02_security_checks.sql` y los Security Advisors.
3. Crea una cuenta administrativa desde **Authentication → Users** por un canal seguro. **No envíes aquí contraseñas ni secretos.**
4. Desde SQL Editor, asigna manualmente el rol al usuario correcto (usa el UUID real):

   ```sql
   -- Sustituir el UUID tras comprobar identidad y autorización del titular.
   insert into public.ets_staff_members (user_id, role, enabled)
   values ('REEMPLAZAR-CON-UUID-DE-AUTH-USERS', 'admin', true);
   ```

5. Configura **solo** los campos `url` y `publishableKey` en `admin/config.js`, usando la URL y la clave **`sb_publishable_...`** del proyecto nuevo. No publiques `sb_secret_...`, `service_role`, contraseñas ni tokens privados.
6. En Supabase configura los controles de Auth, permisos de proyecto, URL del sitio y ajustes de seguridad según el ambiente. Verifica login, cierre de sesión, RLS y que un usuario no autorizado no pueda leer ni escribir.
7. Verifica las autorizaciones y requisitos del operador antes de planificar cualquier lanzamiento comercial.

**Advertencia de arquitectura:** GitHub Pages es alojamiento estático. La seguridad depende de la autenticación y las políticas RLS del servidor, **no** de ocultar archivos HTML o botones. Para pagos, emisión de números, conciliación, validación de identidad y trazabilidad regulatoria hará falta infraestructura de servicios, pruebas y auditoría adicional.

## Roles

- `admin`: prepara/edita borradores, consulta auditoría.
- `operator`: prepara/edita borradores, consulta auditoría.
- `auditor`: consulta rifas y auditoría, sin escritura.

La tabla de roles solo es modificable mediante funciones o accesos privilegiados fuera del navegador público. Las políticas impiden que el frontend declare una rifa autorizada o publicada, y no permiten asignar números.

## Validación

- Sintaxis JavaScript: `node --check admin/app.js && node --check app.js`.
- Demo pública y página de configuración probadas en Chromium para móvil y escritorio.
- La base SQL necesita validarse **en un proyecto Supabase independiente** antes de usarla; hasta entonces es un diseño revisado pero no ejecutado.

## Seguridad adicional antes de producción

MFA obligatoria para administradores, revisión de RLS y Security Advisors, limitación de intentos, trazabilidad resistente a manipulación, backups verificables, separación de entornos, revisión de dependencias, accesibilidad y pruebas de carga. Para cumplimiento normativo se requiere revisión especializada y certificaciones aplicables.

## Versión V8 — premio y galería privada

- El administrador incorpora el botón **Premio y fotos** en *Mis rifas*.
- Permite características del premio y hasta ocho fotografías privadas por borrador.
- Los cambios quedan trazados en `ets_raffle_audit`.
- Migración aditiva: `database/03_prizes_gallery_v8.sql`.
- Más información: [`docs/V8_PREMIOS_Y_FOTOS.md`](docs/V8_PREMIOS_Y_FOTOS.md).
- No reemplazar `admin/config.js` del proyecto conectado al actualizar: ya incluye la URL y clave pública del proyecto Supabase exclusivo.