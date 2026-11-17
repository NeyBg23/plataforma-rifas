# V19 · Pagos manuales por QR y llave

El administrador configura un destino por sorteo desde **Inicio o Mis sorteos → Pagos por QR**. Puede subir una imagen PNG, JPEG o WebP original, escribir la llave o número, indicar el titular y la entidad, y añadir instrucciones. El archivo se conserva sin generar ni reconstruir el QR.

## Recorrido

1. El cliente abre `/pagar/?rifa=UUID`, elige hasta cinco números e indica su nombre y teléfono.
2. PostgreSQL comprueba disponibilidad y registra todo el pedido en una transacción. La retención inicial dura treinta minutos como máximo y termina antes de la fecha del sorteo.
3. El pedido muestra el valor calculado en el servidor y una copia del destino que estaba vigente al crearlo. El cliente reporta la referencia de la transferencia.
4. El estado pasa a `pending_review`. Los números quedan retenidos hasta la decisión del personal.
5. El administrador comprueba el ingreso en su entidad y registra una nota para confirmar o rechazar. La confirmación cambia las asignaciones a `issued`. El rechazo libera los números del pedido.

El seguimiento conserva un acceso privado en el navegador. Permite recuperar el pedido al recargar, consultar el resultado y reintentar una respuesta perdida con el mismo identificador. El identificador por sí solo no permite consultar datos del pedido.

## Preparación y publicación

La configuración se puede preparar para un borrador. El enlace **Probar recorrido completo** abre `/pagar/?rifa=UUID&modo=prueba`, exige personal autenticado y registra pedidos identificados como pruebas. Sus números se guardan en `ets_manual.slots` con un modo independiente.

La apertura pública exige un sorteo `published`, con `authorization_verified`, fecha futura y configuración de pago activa. Esta entrega no cambia las autorizaciones ni publica automáticamente campañas existentes. El catálogo enlaza a la selección de números únicamente para las campañas que devuelve su política pública.

Las aprobaciones son revisiones manuales del personal. La integración de Wompi tiene su propio desarrollo pendiente.

## Datos y permisos

- El esquema privado `ets_manual` contiene configuración, pedidos, posiciones y eventos. Tiene RLS y privilegios revocados a `anon` y `authenticated`.
- `ets-manual-payments` verifica cada sesión del personal con Auth y consulta el rol vigente. Los auditores tienen acceso de consulta.
- Las acciones públicas se limitan a campañas habilitadas o a un pedido cuyo acceso privado coincida. Se almacena el hash SHA-256 del acceso y se rechazan cambios de modo.
- Las funciones SQL usan bloqueos transaccionales por sorteo y modo. El inventario comercial también conserva su clave única por sorteo y número.
- La referencia de una transferencia real no puede utilizarse simultáneamente en dos pedidos del mismo destino. Los reintentos conservan el resultado original.
- El servidor limita pedidos públicos recientes por origen resumido mediante hash y pedidos pendientes por teléfono. La dirección IP no se guarda en texto.
- El bucket `ets-payment-qr` es privado y admite imágenes de hasta 5 MB. El servidor entrega enlaces temporales de carga y lectura. Los QR anteriores se conservan para que los pedidos mantengan su destino histórico.
- Los vencimientos se procesan al consultar o modificar pedidos. Un reporte pendiente de revisión se resuelve por el personal.

## Despliegue y verificación

La migración registrada es `20261117202146_manual_qr_payments.sql`. Se validó en una transacción reversible antes de aplicarla al proyecto `ncbdkllujiakleuhdhhr`.

`npm run build` ejecuta 71 pruebas y genera 46 archivos públicos mediante una lista explícita. `tests/manual_payments_reversible.sql` verifica creación, cálculo de importe, reintentos, acceso ajeno, conflictos sin asignación parcial, vencimiento, aprobación, rechazo y conservación del destino histórico. Debe ejecutarse entre `BEGIN` y `ROLLBACK`.

Las comprobaciones del endpoint verificaron rechazo de consultas administrativas anónimas, consultas de prueba sin sesión, orígenes ajenos y pedidos públicos sobre un borrador. Se realizaron solicitudes concurrentes con la misma selección sobre una campaña temporal de QA.

El 17 de noviembre de 2026 se verificó en el navegador el guardado de una llave ficticia, la creación del pedido de los números 13 y 21, el reporte de la referencia, su confirmación desde el panel y la recuperación del estado al recargar. La concurrencia dejó un solo pedido para los números 88 y 89. La campaña temporal y sus registros se retiraron al terminar. Quedaron un sorteo original en borrador, cero pedidos manuales y cero asignaciones comerciales.

La imagen QR del titular está pendiente de carga y de una comprobación con su archivo. La prueba de navegador utilizó una llave ficticia. El acceso del administrador se recuperó al reactivar el proyecto pausado de Supabase y volver a enviar el formulario que ya contenía sus credenciales.

El frontend se desplegó como un artefacto estático validado en el proyecto Vercel existente. El despliegue de producción es `dpl_4Xf5w1eu7NDhDJK3eiYpPuj6Q7Nx`, asociado a `el-toque-de-la-suerte.vercel.app`. La función `ets-manual-payments` está en la versión 3. El titular autorizó el 17 de noviembre de 2026 publicar el código de esta versión en el repositorio público `NeyBg23/plataforma-rifas`, en la rama `feature/pagos-manuales-qr`.

Si se revierte el frontend, deben conservarse el esquema y los registros de pedidos existentes para su conciliación. Desactivar la configuración impide nuevas selecciones, y los pedidos ya creados conservan su seguimiento.
