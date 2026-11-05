# V18.1 — Laboratorio web aislado e integrado con vista previa privada

## Alcance verificado
- El administrador conserva borradores, fotos y observaciones.
- La vista privada del sorteo (`/admin/vista-previa.html?rifa=...`) ofrece «Probar pedido de laboratorio» para continuar con la selección ilustrativa en `/laboratorio/pedidos-demo.html`.
- El laboratorio recibe únicamente cantidad, precio y números por parámetros de ejemplo. Los parámetros son manipulables: **no se usan para generar ventas ni pedidos reales**.
- Cada pedido simulado dura 120 segundos, se libera o vence en memoria; evita colisiones entre solicitudes dentro de **la misma pestaña**.
- Sin PostgreSQL, Supabase, credenciales, identidad del comprador, registro de boletas, cobros ni Wompi activo.

## Lo que NO demuestra
- No prueba concurrencia entre navegadores, usuarios o servidores.
- No retiene números del inventario comercial ni garantiza disponibilidad real.
- No sustituye seguridad RLS, backend autenticado, webhook, conciliación ni las autorizaciones para operar.

## Futuro backend V18.2
- API de laboratorio con autenticación de personal y separación de estado comercial.
- Validación de sesión y roles en el servidor; idempotencia, locks atómicos, expiración, bitácora y pruebas multi-conexión.
- No desplegar APIs con secretos en el navegador ni habilitar venta por el solo hecho de que el código pase CI.
- Se mantiene sin aplicar la migración de acceso V18 previamente detenida por el control de seguridad.

## Verificaciones
`node --test tests/test_v18_1_domain.mjs`
`npm run build` (incluye pruebas anteriores y lista blanca explícita de archivos públicos).