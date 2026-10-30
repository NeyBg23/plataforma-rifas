# V12.1 — consola de lectura autorizada y despliegue continuo

Alcance: **plataforma en desarrollo**. La integración del backend de pedidos V12 permanece sin activar. No existe cobro, generación de boletas, retención real ni publicación automática de rifas.

## Infraestructura

- Código: `NeyBg23/plataforma-rifas`, rama `main`.
- Vercel: proyecto `el-toque-de-la-suerte`, conectado a GitHub. El primer despliegue Git integrado del commit `2b983b5c...` se verificó `READY`.
- Supabase: proyecto exclusivo `ncbdkllujiakleuhdhhr`.
- Ruta: `/laboratorio/`.

## Consola V12.1

- Comprueba sesión mediante Supabase Auth (`getUser`).
- Consulta `ets_staff_members` y requiere rol habilitado (`admin`, `operator` o `auditor`).
- Muestra exclusivamente métricas de lectura de `ets_raffles`, `ets_number_allocations` y `ets_raffle_audit`; todas están controladas por los permisos y políticas RLS existentes.
- No llama funciones de creación, reserva, liberación, asignación o emisión.
- Muestra errores de consulta sin reemplazarlos con cifras inventadas.
- Los datos personales y la auditoría detallada de pedidos privados no se muestran.
- Usa `textContent` al representar datos del servidor, nunca `innerHTML`.
- El sitio sigue siendo público como código y HTML: los datos protegidos solo se solicitan tras autorización y dependen de RLS.

## Pruebas

```bash
node --check laboratorio/app.mjs
node --test tests/test_v12_1.mjs
npm run build
```

Pruebas de unidad con servicios simulados: acceso anónimo bloqueado, usuario sin rol bloqueado, administrador leyendo cifras. No sustituyen la prueba de extremo a extremo con una cuenta real.

## Pendientes importantes

1. Integrar una API privada de pedidos con autorización por servidor y sin exposición de privilegios de base de datos.
2. Pruebas de autenticación y revocación reales en Supabase.
3. Pruebas de concurrencia, cargas altas y recuperación de fallos del motor de pedidos.
4. Implementar políticas de protección y retención de datos personales antes de registrar compradores.
5. Habilitar pagos/boletas únicamente tras las autorizaciones y controles exigibles.

No introducir usuarios, contraseñas, claves secretas ni datos personales de clientes en repositorios públicos.