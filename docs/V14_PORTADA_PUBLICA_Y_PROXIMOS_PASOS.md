# El toque de la suerte! — V14: portada real, catálogo controlado y ruta de lanzamiento

## Problema resuelto

La antigua portada `index.html` redirigía automáticamente a `experiencia/`, una simulación con rifas ficticias. V14 reemplaza esa redirección por una página principal con navegación, una zona de catálogo real en modo consulta y un acceso independiente a la demostración. Se mantiene el administrador existente en `/admin/`.

## Flujo actual

```text
Visitante (/) -----> Portada V14
                       |
                       +----> Supabase REST /ets_raffles (GET solamente)
                       |          -> RLS: estado published + authorization_verified=true + draw_at presente
                       |
                       +----> /experiencia/ (simulación ficticia separada)
                       +----> /admin/ (Supabase Auth + RLS)
```

**Importante:** el filtro de la interfaz `state=eq.published` no sustituye a RLS. La regla que impide revelar borradores se aplica en PostgreSQL. El cliente no selecciona la columna interna `authorization_verified`, que no está expuesta para `anon`.

## Estado real y limitaciones

- Al implementar V14 había **una rifa en borrador y ninguna rifa publicada**. La portada debe mostrar un estado vacío de campaña, no inventar rifas ni premios reales.
- El catálogo no presenta botones de compra, reserva ni envío de pago.
- La demostración conserva sus números, precios y premios ficticios, claramente diferenciados.
- El bucket de fotografías de borradores es privado. La portada no lo expone ni usa URLs firmadas de esas imágenes. Un mecanismo seguro de medios públicos tendrá que definirse en una etapa posterior.
- Wompi es solamente un proveedor previsto. No hay credenciales, cobros, intentos de pago, firma de integridad, webhooks ni conciliación.
- El proyecto está desplegado en Vercel Hobby como desarrollo; el uso comercial requiere revisar las condiciones del plan y la infraestructura regulatoria aplicable.

## Plan de ingeniería recomendado

### V15 — Circuito editorial y autorización

Crear un expediente por campaña con gestor, documentos regulatorios, vigencias, responsables, verificación, checklist de información al consumidor, historial de decisiones y aprobación interna separada de la autorización legal externa. No usar un simple interruptor manual `authorization_verified=true` como sustituto de una autorización real. Añadir un catálogo de detalles con media pública separada del almacenamiento privado de borradores, y una prueba de RLS que demuestre que el público no puede acceder a campañas no habilitadas.

### V16 — Identidad del cliente y pedidos de prueba

Diseñar identidad mínima, consentimiento y tratamiento de datos, validación de edad, sistema de pedidos con idempotencia, referencias server-side, expiración, estado y auditoría, con pruebas de concurrencia y fallos. Todo en entorno de pruebas sin pagos comerciales ni asignaciones reales.

### V17 — Wompi sandbox

Implementar una interfaz de pasarela con adaptador, creación de intención de pago exclusivamente en backend, referencia única, firma de integridad conforme a documentación vigente, recepción y validación de eventos, idempotencia de webhooks y conciliación. Mantener un feature flag cerrado y separar credenciales de prueba de producción. Verificar previamente la aceptación de la actividad por parte de Wompi y requisitos legales aplicables.

### V18 — Revisión preoperativa

Revisar residencia y redundancia de datos, registro inmutable, auditoría de seguridad, políticas antifraude, reportes, privacidad, atención al usuario, obligaciones regulatorias y certificaciones requeridas. Hacer pruebas de carga, recuperación, accesibilidad y revisión independiente antes de cualquier operación comercial.

## Comprobaciones de V14

- 7 pruebas unitarias nuevas para portada, filtro de catálogo, entradas no autorizadas, errores de API y pagos desactivados.
- Prueba SQL de lectura bajo el rol `anon`: devuelve cero rifas cuando solo existe el borrador.
- Verificar en Vercel que la compilación se detenga si falla cualquiera de las pruebas integradas al script `npm test`.
- Revisión visual del navegador local limitada por política de acceso del entorno; efectuar smoke tests en Vercel con sesión permitida.

## Referencias de trabajo

- Proyecto Supabase: `ncbdkllujiakleuhdhhr`.
- GitHub: `NeyBg23/plataforma-rifas`.
- Vercel: `el-toque-de-la-suerte` en equipo `haimpress`.