# V15 — Expedientes de campañas y revisión documental

## Entrega

- `/admin/expediente.html?rifa=<uuid>`: panel privado integrado desde **Mis rifas → Expediente**.
- `/admin/dossier.mjs`: cliente autenticado con Supabase Auth; verifica el rol en `ets_staff_members` y utiliza exclusivamente políticas RLS de la base de datos.
- `/admin/dossier-domain.mjs`: reglas puras de archivos y checklist; no verifica autorizaciones.
- `database/09_v15_campaign_dossiers.sql`: migración aditiva con tres tablas, RLS, disparadores de auditoría y bucket privado de documentos.

## Modelo

- `ets_campaign_dossiers`: organizador, autoridad competente, referencia declarada y observaciones.
- `ets_campaign_documents`: metadatos de documentos, ruta privada, tipo, tamaño, usuario y fecha. Solo altas y lectura: **sin cambios ni borrado de registros**.
- `ets_campaign_review_notes`: observaciones inmutables, solicitudes de corrección y preparación interna para revisión externa.
- `ets-campaign-evidence`: bucket **privado**, PDF/JPG/PNG hasta 10 MiB cada uno. Archivos por `raffle_id/user_id/file_uuid.ext`.
- Cada alta documental y cada cambio de ficha crea eventos en `ets_raffle_audit`.

## Control de permisos

- Visitante sin sesión: acceso denegado.
- Auditor: consulta, sin cambios.
- Administrador/operador activos: edición de campañas en `draft`, `in_review` o `awaiting_authorization` siempre que `authorization_verified=false`.
- Las modificaciones están sujetas a **políticas PostgreSQL**; deshabilitar botones no constituye medida de seguridad.
- La consulta pública sigue filtrando solo rifas con `state='published'`, `authorization_verified=true` y fecha registrada. La migración V15 **no** ofrece función ni credencial para activar esos estados.

## Lista de controles

Señales informativas: campaña, ficha del premio, fotos, gestor/autoridad declarados, soportes, fecha y verificación externa. Completitud documental **no demuestra autorización**.

## Comprobaciones realizadas

1. `node --test tests/test_v15_domain.mjs`: 10 pruebas de reglas de negocio superadas en entorno local.
2. `node --check` en los controladores JS.
3. SQL aplicado a proyecto exclusivo `ncbdkllujiakleuhdhhr`.
4. Comprobado: tres nuevas tablas con RLS, bucket `public=false`, rol `anon` sin lectura de documentos, 1 rifa y 4 fotos conservadas, 0 números comerciales asignados.
5. La automatización visual de navegador **no pudo ejecutarse**: el entorno bloqueó abrir páginas locales. Queda pendiente una prueba interactiva manual con usuario real, una cuenta auditor y un visitante sin sesión.

## Prueba manual sugerida

1. Ingresa al administrador desde Vercel.
2. En **Mis rifas → Expediente**, abre la rifa de prueba.
3. Registra un gestor/organizador ficticio y la autoridad como datos de ejemplo; guarda.
4. Adjunta un PDF de prueba que no contenga información personal ni un documento oficial real.
5. Registra observación y revisa el historial de la rifa.
6. Comprueba que **no** aparezca en el catálogo público ni existan botones de venta.

## Pendiente de fase siguiente

- Verificar permisos reales con diferentes usuarios (no solo pruebas simuladas).
- Flujos formales de revisión por responsables independientes, revisión antifraude y verificación real de documentos.
- Control de versiones y verificación de hash de documentos en servidor.
- Replicación/custodia certificable y políticas de retención documental.
- Un flujo de autorización y publicación diseñado con asesoría legal, separado del frontend y de la cuenta administradora normal.
- Wompi permanece totalmente deshabilitado: falta validación de la actividad comercial, homologación con el proveedor, webhook/conciliación y cumplimiento jurídico y técnico.

Esta implementación es **preparación de producto**, no habilitación regulatoria.