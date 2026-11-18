# Publicar una ficha en el catálogo

Abre **Publicación** desde el inicio del panel. Ahí verás el dato que falte y el acceso para completarlo. Indica el tipo de premio, su descripción y cómo se entrega. Guarda el número de la autorización y adjunta el soporte privado. La galería y **Enviar a revisión** son opcionales.

La comprobación del acto es un paso de administración de la base de datos. El responsable debe cotejar con la entidad emisora el premio, la fecha y el alcance de la difusión por internet antes de registrar el resultado. La función privada `ets_internal.record_raffle_authorization(raffle_id, document_id, reviewer_id, verified_reference, verification_note)` registra quién revisó, el soporte cotejado y una huella de los datos aprobados. La nota de verificación debe identificar la fuente y el alcance confirmado. La función no está disponible para cuentas web, incluidas las del panel. Cargar un soporte o guardar una observación no realiza ese cotejo.

Con una comprobación registrada y vigente, la cuenta administradora puede pulsar **Publicar ficha** directamente desde el borrador. El estado `listed` muestra título, descripción, fecha y valor en el catálogo. La política de lectura sigue restringida a fichas verificadas y las fotografías de borrador, el expediente y los datos de pago permanecen privados. El estado `published` del flujo de pedidos sigue separado.

La publicación rechaza premios en efectivo y bienes usados en esta modalidad. La referencia normativa es el artículo 2.7.3.2 del Decreto 1068 de 2015, modificado por el Decreto 1486 de 2024. [Decreto 1486 de 2024](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=256696)

## Despliegue y verificación

Para instalaciones nuevas, aplica `20261117225310_verified_catalog_listing.sql` antes de desplegar la función `ets-manual-payments`. Aplica después `20261118160535_streamline_catalog_publication.sql` y despliega el sitio. La última migración simplifica los requisitos internos y conserva las filas.

`npm run build` comprueba el catálogo y las operaciones del cliente. Ejecuta `tests/publication_reversible.sql` en una base aislada con un administrador y un operador ficticios y los esquemas de la aplicación. Comprueba el flujo completo hasta la lectura pública, el bloqueo de efectivo, los permisos, los cambios posteriores a la verificación, la auditoría y la separación de pedidos.
