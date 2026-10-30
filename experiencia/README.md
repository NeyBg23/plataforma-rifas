# V11: experiencia de cliente — laboratorio UI

Esta carpeta es una **demostración interactiva** aislada de la plataforma de ventas. No conecta con Supabase ni con la tabla real `ets_number_allocations`, no cobra dinero, no genera boletas y no solicita datos personales.

## Pantallas

- Catálogo de premios ficticios con modo oscuro/claro.
- Detalle del premio y selección de 1 a 5 números **simulados**.
- Resumen accesible con confirmación explícita de simulación.
- Referencia aleatoria local `DEMO-XXXXXXXX` y historial de eventos **solo de interfaz**.
- Seguimiento local y preguntas frecuentes.

## Arquitectura

- `catalog.mjs`: catálogo ficticio, sin conexión comercial.
- `demo-domain.mjs`: reglas puras de números, total, contratos de pedido e idempotencia local.
- `app.mjs`: controlador de UI y navegación por hash compatible con GitHub Pages.
- `styles.css`: tokens de diseño oscuro/claro naranja y dorado.
- `assets/`: ilustraciones locales incluidas en el repositorio.

La persistencia de ejemplo usa `localStorage`, no es fiable para transacciones reales y **no debe reutilizarse para pagos**. La referencia puede perderse al borrar datos del navegador o cambiar de dispositivo. Los eventos simulados no prueban una compra.

## Pruebas

Desde la raíz del repositorio: `node --test tests/v11_domain.test.mjs`.

> Para una integración real: backend autenticado, flujo de órdenes y pagos idempotentes, controles regulatorios y trazabilidad persistente en servidor. El laboratorio SQL V11 es separado y no expone APIs a clientes.