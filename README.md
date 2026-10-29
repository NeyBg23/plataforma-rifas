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
