# El toque de la suerte! ✦

**V6 — Experiencia pública intuitiva con dos temas y seguimiento demostrativo.**

Prototipo web de una futura plataforma de rifas en Colombia. Identidad visual negro, **naranja neón** y **oro**, con tema claro marfil. **No se reciben pagos, no se venden números ni se emiten boletas reales.**

## Probar la página

- Sitio: https://neybg23.github.io/plataforma-rifas/
- Repositorio: https://github.com/NeyBg23/plataforma-rifas
- Ejecución local: `python -m http.server 8080`; abrir `http://localhost:8080`.

## Novedades V6

- Alternancia oscuro/claro; tema persistente en el navegador.
- Portada, catálogo y fichas de premio renovadas.
- Selección simulada de hasta cinco números entre una muestra de 30 y resumen previo a continuar.
- Referencia local `DEMO-XXXXXXXX`, fecha, números elegidos y total de referencia, con **$0 cobrado**.
- **Mi seguimiento:** consulta local por código o premio.
- **Resultados:** información honesta de que aún no existen sorteos ni ganadores reales.
- **Ayuda:** preguntas frecuentes y límites de la demostración.
- Panel administrativo V5 conservado: borradores, filtros, revisión, edición y respaldo JSON.

## Recorrido de prueba

1. Abrir **Premios** y elegir un ejemplo.
2. Seleccionar números de la muestra.
3. Pulsar **Continuar** y comprobar el total.
4. Pulsar **Guardar simulación**: no se procesa ningún pago.
5. Ver y buscar el código en **Mi seguimiento**.
6. Cambiar entre **Claro / Oscuro** desde la cabecera.

## Límites y seguridad

- Catálogo, fotos ilustrativas, fechas, porcentajes y cifras son ejemplos, no ofertas reales.
- La referencia de seguimiento es local, no es una boleta, reserva ni comprobante de pago.
- `localStorage` no es una base de datos compartida, no brinda trazabilidad oficial ni inventario transaccional.
- La administración sigue siendo **una demo pública, no un área protegida con login**.
- No existe pasarela, autenticación real, verificación de edad, cuentas de clientes, auditoría formal, certificación ni autorización para operar rifas.
- No publicar claves API secretas, certificados privados, datos personales o archivos `.env` en el repositorio.
- No presentar la plataforma como autorizada por Coljuegos antes de obtener las aprobaciones aplicables.

## Hitos para operación futura

1. Validación regulatoria y documental de gestor, operador y autorización de rifas.
2. Acceso seguro y roles, verificación legal de participantes y protección de datos.
3. Datos autorizados de gestor/rifa/premios/condiciones, controles de publicación.
4. Reservas atómicas, caducidad de reservas, control de concurrencia y boletas únicas.
5. Órdenes, pasarela, conciliación e idempotencia de pagos.
6. Eventos auditables, notificaciones y seguimiento privado en distintos dispositivos.
7. Sorteos y resultados verificables, supervisión, seguridad, pruebas y certificación.

**Marca:** El toque de la suerte! · **Versión:** V6 · **Estado:** prototipo público sin transacciones.