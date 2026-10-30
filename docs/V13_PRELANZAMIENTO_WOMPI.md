# V13 — Vista de prelanzamiento y espacio de integración Wompi

## Alcance real (30 oct. 2026)

Se unifica la página inicial con la experiencia pública situada en `experiencia/`, conservando el panel `/admin/`, la consola `/laboratorio/` y los datos existentes en Supabase. Los precios, premios y números del catálogo de demostración son ficticios, y las referencias `DEMO-` permanecen en el almacenamiento local del navegador. **No existe compra, reserva comercial, pago, autorización de rifa ni boleta real.**

La interfaz tiene temas claro/oscuro, seguimiento local ilustrativo, flujo guiado, pantallas responsive, avisos de entorno de prueba, ayuda y la sección `#/pagos` dedicada a la futura integración Wompi. En el resumen se muestra Wompi como **integración prevista y totalmente deshabilitada**.

## Arquitectura del proveedor de pagos (futura, NO implementada)

```text
Usuario -> Portal web (Vercel)
                 |
                 v
         API autenticada (futura)
                 | valida rifa autorizada, cliente, número e importe
                 v
         Motor transaccional PostgreSQL (futuro)
                 | pedido + retención + idempotencia
                 v
         Adaptador Wompi en backend (futuro)
                 | referencia única, importe COP centavos, firma integridad
                 v
         Checkout Wompi (sandbox -> producción cuando proceda)
                 | notificación transaction.updated al servidor
                 v
         Webhook validado + conciliación idempotente
                 | confirmación después de pago aprobado
                 v
         Registro auditable / emisión regulada
```

### Contratos propuestos, sin endpoint activado

- `PaymentProvider`: `createPaymentSession(orderId, idempotencyKey)` y `handleVerifiedEvent(event)`.
- `PaymentSession`: `{provider, providerReference, amountInCents, currency, expiresAt, checkoutParameters}` (no contiene secretos).
- `PaymentEvent`: `{providerEventId, providerTransactionId, reference, status, amountInCents, occurredAt, signatureVerified}`.
- `PaymentStatus`: `not_started`, `pending`, `approved`, `declined`, `voided`, `error`.
- Implementación futura: `POST /api/payments/wompi/session` y `POST /api/webhooks/wompi`. Estos endpoints **no existen** en V13 y no deben ser conectados desde el navegador todavía.

### Controles antes de activar Wompi

1. Verificar jurídicamente la autorización del operador y el permiso de cada rifa, así como la normativa técnica y de protección de datos aplicable.
2. Confirmar **por escrito** que Wompi acepta esta actividad concreta y la estructura de gestor/operador; cumplir sus condiciones comerciales y prevención de fraude.
3. Conservar `pub_test_...` en sandbox; almacenar claves privadas, secretos de integridad y de eventos **solo en el backend**, nunca en GitHub o HTML.
4. Obtener referencia única, monto y moneda desde la **base de datos transaccional**. No confiar en precios ni números enviados desde JS del cliente.
5. Firmar valores con SHA-256 del lado del servidor conforme a documentación vigente; no enviar la clave de integridad al cliente.
6. Validar webhooks, autenticar origen mediante las reglas Wompi, verificar monto/moneda/referencia, aplicar idempotencia, prevenir reprocesamiento y reconciliar estados. La redirección del comprador no demuestra aprobación.
7. Hacer pruebas sandbox, de concurrencia, reintentos, cobro doble, pagos tardíos y vencimientos; luego pasar revisiones técnicas, legales y operativas.
8. Solo habilitar checkout comercial con **múltiples controles del servidor**, no con un interruptor de frontend.

Fuentes oficiales: https://docs.wompi.co/docs/colombia/widget-checkout-web/ y https://docs.wompi.co/docs/colombia/eventos/

## Separación frontend y backend

- `experiencia/payment-gate.mjs` existe para describir el proveedor y **rechaza siempre** `beginPayment()`.
- `experiencia/app.mjs` no invoca API de cobro ni obtiene datos de compradores reales.
- `scripts/build-site.mjs` (lista blanca) empaqueta únicamente HTML, CSS, JS público e ilustraciones. **No incluye migraciones SQL, Edge Functions, pruebas ni documentos internos.**
- El administrador `/admin/` continúa con autenticación y RLS de Supabase; el portal de premios ficticios no consulta inventario real.
- Vercel y GitHub Pages pueden mostrar la misma vista previa. Mantener `noindex` hasta la publicación regulada.

## Qué no es V13

No es un sitio listo para recaudo, no constituye un ambiente certificado para rifas y no prueba la autorización de Coljuegos. Los criterios de operación comercial, residencia de datos, controles de auditoría y requisitos del proveedor de pagos aún deben verificarse. No promocionar estas páginas como rifas abiertas al público.

## Pruebas

- `npm test`: reglas de dominio V11, permisos simulados V12.1 y pasarela deshabilitada V13.
- `node --check experiencia/app.mjs` y `node --check experiencia/payment-gate.mjs`.
- Prueba responsive (verificador de navegador disponible según entorno). La prueba de navegador en entorno aislado no constituye validación con API real.
- `npm run build`: verifica tests + lista blanca `dist/`.