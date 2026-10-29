# El toque de la suerte! ✦

**Prototipo web V4** de una plataforma colombiana de rifas, con estética **negra y naranja neón**, diseñada para la experiencia del cliente final y un futuro panel administrativo.

## Demo

Abre `index.html` directamente en el navegador o sirve los archivos de forma local:

```bash
python -m http.server 8080
```

Luego entra en http://localhost:8080.

## Funciones disponibles

- Portada y catálogo de premios de ejemplo.
- Filtros por categoría y ficha de cada premio.
- Selección simulada de números y resumen del valor.
- Panel administrativo conceptual y borradores guardados en el navegador.
- Diseño responsivo para computador y móvil.


## Panel administrativo intuitivo — V5

Abre `#admin` para entrar al panel demostrativo. En el panel encontrarás:

- **Resumen comprensible:** cantidad de rifas ilustrativas, borradores, revisiones internas y ventas reales (siempre 0 en esta demo).
- **Creación guiada en tres pasos:** premio → cantidad y precio → revisión y guardado.
- **Listado de rifas:** búsqueda por nombre y categoría, filtros para borradores, ejemplos y revisión interna.
- **Edición y eliminación con confirmación**, copia de rifas de ejemplo a borradores.
- **Copia de seguridad JSON** descargable para conservar los borradores del navegador.
- **Guía rápida** en `#admin/ayuda`, con instrucciones sin lenguaje técnico.

**Importante:** cualquier persona que visite la página puede abrir esta demo del panel, pero los borradores se conservan solo en el navegador local de quien los creó. **No existe control de acceso, autenticación, base de datos de producción, clientes reales ni pagos.** No debe usarse para operar rifas ni almacenar información sensible. La etiqueta «En revisión interna» no representa aprobación gubernamental ni comercial.

El próximo desarrollo real necesita backend, autenticación autorizada por roles, almacenamiento y permisos seguros; una reserva de números jamás debe depender del navegador.

## Estado del proyecto

**Solo demostración; sin operación comercial.** Los premios, fechas, precios, porcentajes, números y estadísticas son ficticios. No existe conexión a pasarela de pagos, emisión oficial de boletas, asignación transaccional, autenticación real, infraestructura certificada ni autorización vigente para comercializar rifas. Los datos locales no deben utilizarse para operaciones reales.

**No se debe anunciar que la plataforma o sus rifas están autorizadas por Coljuegos** antes de contar con los actos y condiciones aplicables.

## Próximos hitos

1. Arquitectura del Sistema Central de Juego y modelo de datos.
2. Autenticación y control de roles (administrador, gestor, participante, auditor).
3. Gestión de rifas y autorización de publicación.
4. Inventario transaccional y reservas atómicas que impidan números duplicados.
5. Pagos, conciliación idempotente, boletas, sorteos y reportes.
6. Seguridad, trazabilidad, pruebas y documentación de cumplimiento técnico.

## Seguridad

No subas claves API privadas, tokens, contraseñas, datos personales o archivos `.env` a este repositorio público.

---

**Nombre comercial:** El toque de la suerte!  
**Repositorio:** [NeyBg23/plataforma-rifas](https://github.com/NeyBg23/plataforma-rifas)