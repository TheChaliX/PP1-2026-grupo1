
# Entrega 3: Frontend codificado

**Materia:** Práctica Profesionalizante I (PP1) — 2026  
**Proyecto:** Sistema de reservas de alojamientos (TP Reservas)  
**Grupo:** Grupo 1 — [Sarco Thiago, Nanzer Benjamin, Chalita Antonio y Hernandes German Mateo]  
**Fecha de entrega:** 24/09/2026

## Cómo probarlo

El frontend se prueba **servido con Live Server** (VS Code), no abriendo el HTML con doble clic, porque `fetch` no funciona con `file://`. Punto de partida: `frontend/index.html`.

## Organización del código

```text
frontend/
├── assets/
│   ├── css/styles.css
│   ├── img/
│   └── js/         un .js por pantalla
├── data/           catalogo.json, reservas.json, catalogo-vacio.json
├── index.html
└── *.html
```

## Capacidades implementadas

| Capacidad | Pantalla | Archivo JS | CU de E1 | Qué hace |
|---|---|---|---|---|
| 1. Login validado | `login.html` | `assets/js/login.js` | CU-XX | Con `preventDefault()` evita el envío. Valida campos vacíos, formato de email (regex) y largo de la contraseña. Muestra el error en el DOM (no usa `alert()`) y, si todo es válido, redirige a `catalogo.html`. |
| 2. Listado desde datos | `catalogo.html` | `assets/js/catalogo.js` | CU-XX | Trae `data/catalogo.json` con `fetch`, transforma los datos con `map` y dibuja las tarjetas con `crearTarjeta()` en `#contenedor-catalogo` (vacío en el HTML). Filtra por ubicación y rango de tarifa. |
| 3. Acción del usuario | `detalle.html` | `assets/js/detalle.js` | CU-XX | Lee las fechas y los huéspedes, valida (campos vacíos y salida posterior a entrada) y guarda la reserva con `guardarReserva()`, una función aparte que hoy escribe en memoria. La reserva se agrega con estado "Confirmado" a la lista "Reservas realizadas" de la misma pantalla, sin recargar. |
| 4. Estados de interfaz | `catalogo.html` | `assets/js/catalogo.js` | CU-XX | **Cargando:** mensaje mientras espera el `fetch`. **Vacío:** mensaje cuando la lista no tiene ítems. **Error:** mensaje legible en el `catch` si el `fetch` falla. |
| 5. Pantalla del anfitrión | `publicar-alojamiento.html` | `assets/js/publicar-alojamiento.js` | CU-XX | Formulario validado (textos vacíos y valores numéricos mayores a cero). Convierte la imagen a Base64, guarda con `guardarAlojamiento()` y redirige al catálogo, donde aparece el alojamiento publicado. |

### Otras pantallas con JavaScript

| Pantalla | Archivo JS | Qué hace |
|---|---|---|
| `registro.html` | `assets/js/registro.js` | Valida campos vacíos, email, largo y coincidencia de contraseñas. |
| `reservas.html` | `assets/js/reservas.js` | Dibuja las reservas desde `data/reservas.json` (unidas con el catálogo por `alojamientoId`), con filtros por estado y cancelación. |

### Pantallas estáticas por ahora

`index.html`, `mis-propiedades.html`, `calendario.html`, `reservas-recibidas.html`, `perfil.html` y `recuperar.html`. Reciben JavaScript en las etapas siguientes, junto con la conexión al backend.

## Cómo demostrar los tres estados

- **Vacío:** en `catalogo.js`, cambiar la ruta del `fetch` a `data/catalogo-vacio.json` (antes ejecutar `localStorage.clear()` en la consola, porque el catálogo también muestra lo publicado).
- **Error:** cambiar la ruta del `fetch` por una que no exista, por ejemplo `data/xxx.json`.
- **Cargando:** se ve un instante al abrir la página; se nota más con la red de DevTools en modo lento.

## Decisiones del grupo

- **Un `.js` por pantalla**, todos en `assets/js/` y cargados al final del `<body>`. Cada archivo tiene una responsabilidad, y así se ve qué código pertenece a cada pantalla.
- **Capacidad 5: Publicar alojamiento.** Se eligió porque es la acción central del anfitrión (CU-XX): crea el alojamiento que después el huésped ve en el catálogo. Cumple con un formulario con validación que actualiza la pantalla siguiente. [Ajustar la justificación contra el CU de E1.]
- **Datos:** `catalogo.json` (8 alojamientos) y `reservas.json`. `alojamientoId` en `reservas.json` referencia al `id` del catálogo. `catalogo-vacio.json` es un archivo auxiliar solo para demostrar el estado vacío.
- **Uso de `localStorage` (distinto de lo pedido).** La consigna no lo pide. Se usó en `publicar-alojamiento.js` para que el alojamiento publicado aparezca en el catálogo después de la redirección, ya que sin backend los datos no persisten entre pantallas. Es código provisorio: al conectar el backend cambia solo el cuerpo de `guardarAlojamiento()` (pasa a un `fetch` con POST).
- **Reserva en memoria.** En `detalle.js` la reserva vive en un array. Al cambiar de pantalla se pierde, y "Mis reservas" se dibuja desde su propio `reservas.json`, como indica la consigna.

## Declaración de uso de IA

Modo asistido. Se consultó a un asistente de IA (Claude) para:

- Interpretar errores de la consola (por ejemplo, un `SyntaxError` en `catalogo.js`).
- Depurar rutas relativas de CSS e imágenes en `calendario.html`, `reservas-recibidas.html` y `mis-propiedades.html`, y un choque de nombres de clase (`.estado`) en `styles.css`.
- Resolver problemas de git: commit, merge, conflictos y `revert`.