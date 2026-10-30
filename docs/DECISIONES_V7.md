# Decisiones de arquitectura — V7

1. **Separación visual**: conservar el sitio público V6 y agregar `/admin/` con su propia interfaz, sin interrumpir GitHub Pages.
2. **Aislamiento de datos**: NO usar el Supabase existente de otro negocio; el nuevo proyecto deberá ser dedicado.
3. **Denegación por defecto**: si falta configuración pública o el rol no está asignado, el administrador no carga datos.
4. **Autorización servidor**: `ets_staff_members` + políticas RLS. No confiar en datos de perfil editables por el usuario ni en ocultar botones.
5. **No ventas**: no hay endpoint de compra, reserva ni publicación desde frontend; `ets_number_allocations` solo tiene lectura interna y clave única.
6. **Publicación bloqueada**: los usuarios de browser no pueden fijar `authorization_verified=true` ni pasar a `published` por las políticas y permisos SQL.
7. **Auditoría**: registros realizados por trigger SQL con función aislada de la API pública; no pueden escribirse desde el navegador.
8. **Mínimo dato personal**: V7 no registra compradores, teléfonos, documentos ni datos financieros.
9. **CDN temporal**: SDK Supabase UMD fijo en 2.118.0; evaluar bundle propio, seguridad de dependencias y política CSP antes de producción.
10. **Sin certificación implícita**: la interfaz nunca afirma estar autorizada por Coljuegos o que las boletas demo sean compras efectivas.

## Requisitos por cerrar antes de comercializar

- Autorización como operador tecnológico y aprobación de cada rifa, según competencia aplicable.
- Requisitos técnicos del sistema central, certificación, auditoría externa y alojamiento, conforme a normativa vigente.
- Modelo transaccional de reservas atómicas + expiración + idempotencia y reconciliación de pagos.
- Protección de datos, consentimiento, control de edad/identidad, seguridad de API, alertas y respuesta a incidentes.
- Registro del sorteo, resultados comprobables, reglas visibles y gestión de reclamaciones.