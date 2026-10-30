# V8 — Fichas de premios y fotografías privadas

## Implementación

Se añadió una ficha opcional para cada rifa (`ets_prizes`) y una galería (`ets_prize_images`) de hasta ocho fotografías, con portada, texto alternativo y orden. Los cambios se registran por disparadores SQL en `ets_raffle_audit`, que ahora se visualizan con los campos que cambiaron.

Los archivos se guardan en `storage` dentro del bucket **privado** `ets-prize-drafts`. Las vistas previas utilizan URL firmadas de duración limitada y no forman parte del catálogo público.

## Cómo probar

1. Ingresa en `/admin/` con la cuenta administrativa ya habilitada.
2. En **Mis rifas**, abre **Premio y fotos** para una rifa en estado *Borrador*.
3. Llena marca, modelo, estado del artículo, detalles, contenido y condiciones de entrega. Guarda.
4. Sube una foto JPG, PNG o WebP de hasta 5 MB, con una descripción clara. La primera se marca como portada.
5. Sube otra fotografía para probar **Usar de portada**, **Editar texto** y **Quitar**.
6. Revisa **Historial** para verificar la auditoría de cambios.
7. Reingresa al panel para verificar persistencia real, no local.

### Restricciones

- Solo administradores y operadores habilitados pueden modificar fichas y galerías de rifas en `draft` sin autorización verificada.
- Los auditores tienen acceso de consulta; no pueden escribir.
- En `in_review` o estados posteriores, la ficha y la galería solo se consultan.
- Ningún visitante anónimo puede acceder a las tablas de premios ni a los archivos privados.
- No se activan ventas, reservas, pagos, boletas ni publicación de rifas.
- Validación de formato y tamaño en frontend y bucket. Hay un límite de ocho fotos en base de datos.
- Los cambios de portada se realizan como dos operaciones; si hay problemas de red, conviene refrescar la ficha para comprobar el estado. Antes de operar comercialmente se requerirá un procedimiento transaccional y control de concurrencia completo.
- El borrado de foto elimina primero la referencia en PostgreSQL y luego el objeto en Storage. Si falla el segundo paso puede quedar un archivo huérfano, y el panel lo notificará para mantenimiento posterior.

## Pendiente antes de producción

- Tratamiento y revisión de metadatos EXIF, antivirus y procesado de imágenes (servidor).
- Auditoría de pruebas reales de RLS para rol auditor, usuario anónimo y operador.
- Revisión de residuos en Storage, backup y retención de auditoría.
- Migrar a un backend validado con infraestructura conforme a los requisitos regulatorios aplicables.