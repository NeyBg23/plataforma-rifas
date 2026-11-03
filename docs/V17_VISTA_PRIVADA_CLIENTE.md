# V17 — Vista privada de cliente sobre una rifa real

## Objetivo

Permitir que el personal visualice un borrador tal como podría presentarse al público, sin publicar campañas y sin duplicar el catálogo de datos. El sistema reutiliza las mismas tablas, fotografías y sesión Supabase del administrador V16.1.

## Uso

1. Iniciar sesión en `https://el-toque-de-la-suerte.vercel.app/admin/`.
2. Desde Inicio o Mis sorteos, pulsar `Vista cliente` junto a una rifa.
3. Ver título, descripción, precio configurado, numeración, fecha prevista, ficha del premio y fotografías privadas.
4. Seleccionar hasta cinco números **solo de ejemplo** y ver un cálculo local. No se retienen ni se venden.

## Arquitectura y límites

- Ruta: `/admin/vista-previa.html?rifa=UUID`.
- No debe ponerse en la página pública ni indexarse.
- Usa Supabase Auth para verificar usuario y `ets_staff_members` para verificar `enabled` y rol `admin`, `operator` o `auditor`.
- Las consultas a `ets_raffles`, `ets_prizes` y `ets_prize_images` respetan RLS/GRANT: la autorización efectiva es del servidor. La comprobación visual del rol no sustituye RLS.
- Fotografías del bucket privado `ets-prize-drafts`: enlaces firmados por **120 segundos**, creados solo después de verificar sesión/rol, además restringidos al dominio y ruta esperados. Volver a cargar si los enlaces caducan.
- Los campos del premio se presentan con `textContent`, nunca HTML interpolado de la BD.
- La selección y el resumen se mantienen exclusivamente en memoria del navegador, se pierden al salir y no consultan ni modifican `ets_number_allocations`.
- Wompi solo aparece como proveedor previsto, sin checkout ni credenciales.
- No hay nuevas tablas, cambios de RLS, migraciones, funciones públicas o nuevas autorizaciones.

## Comprobaciones

Ejecutar `npm test` (incluye pruebas V11–V17) y `npm run build` (allowlist estática y tests previos al despliegue). Probar manualmente en Vercel con cuenta autorizada:

- Borrador real: renderiza sus datos y fotos privadas (cuatro archivos presentes en el proyecto).
- URL sin UUID: rechazada.
- Sin sesión o rol: no muestra el borrador ni genera enlaces firmados.
- Temas claro/oscuro, móvil, paginación de 100 números, máximo cinco números simulados.
- Ningún botón permite reservar, comprar, pagar o publicar.

## Puertas restantes para lanzamiento comercial

Integración del inventario transaccional para pedidos, pruebas de concurrencia bajo carga, Wompi sandbox (referencia e integridad firmadas en servidor + webhooks verificados e idempotentes), términos y protección de datos, garantías, certificación y autorizaciones aplicables, verificación de infraestructura. Vercel Hobby solo se usa en desarrollo/no comercial.