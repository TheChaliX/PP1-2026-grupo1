# Entrega 4: Backend integrado

**Materia:** Práctica Profesionalizante I (PP1) — 2026
**Proyecto:** Sistema de reservas de alojamientos (TP Reservas)
**Grupo:** Grupo 1 — Sarco Thiago, Nanzer Benjamin, Chalita Antonio y Hernandes German Mateo
**Fecha de entrega:** 12/11/2026

## Cómo levantarlo

1. **Base (PostgreSQL en Neon):** la estructura está en `backend/db/schema.sql`. Se corre desde el SQL Editor de Neon. Usa `CREATE TABLE IF NOT EXISTS`, así que sobre la base actual no borra nada y en una base vacía crea todas las tablas.
2. **Backend:** definir la variable de entorno `DB_PASSWORD` con la contraseña de Neon y correr `OpenlodgeApplication`.
   - IntelliJ: *Run → Edit Configurations → Environment variables* → `DB_PASSWORD=...`.
   - Opcionales: `DB_URL` y `DB_USER` (por defecto apuntan a la base de Neon del grupo).
   - Si las tablas están vacías, al arrancar el backend carga los datos iniciales (tipos, servicios, ciudades y alojamientos de ejemplo).
3. **Frontend:** abrir `frontend/index.html` con Live Server (puerto 5500). La dirección del backend está en una sola constante: `API_BASE` en `assets/js/sesion.js`.

La estructura de la base la define el script; Hibernate corre con `ddl-auto=validate` y solo verifica que coincida con las entidades. La contraseña no está en el repo.

**Base:** se usa PostgreSQL alojado en Neon (en la nube) en lugar de MySQL local, con el visto bueno del docente.

## Módulos

| Módulo | Pantalla | JS | Endpoint | Tablas |
|---|---|---|---|---|
| **M1 Acceso** | `login.html`, `registro.html` | `login.js`, `registro.js`, `sesion.js` | `POST /api/auth/login`, `POST /api/auth/registro`, `POST /api/usuarios/{id}/cambiar-modo` | `usuario`, `tipo_usuario` |
| **M2 Buscar** | `catalogo.html` | `catalogo.js` | `GET /api/hospedajes` | `hospedaje`, `ciudad`, `servicio_hospedaje`, `servicio`, `hospedaje_imagen` |
| **M3 Detalle** | `detalle.html?id=N` | `detalle.js` | `GET /api/hospedajes/{id}`, `GET /api/reservas/hospedaje/{id}/ocupacion` | `hospedaje` (+ las de M2), `reserva` |
| **M4 Reservar** | `detalle.html` (formulario) y `reservas.html` | `detalle.js`, `reservas.js` | `POST /api/reservas`, `GET /api/reservas/usuario/{id}`, `POST /api/reservas/{id}/cancelar` | `reserva` |
| **M5 Anfitrión: reservas recibidas** | `reservas-recibidas.html` | `reservas-recibidas.js` | `GET /api/reservas/anfitrion/{id}` | `reserva` ⨝ `hospedaje` (por `id_anfitrion`) ⨝ `usuario` (huésped) |
| **Regla de negocio + JUnit** | — | — | `ReservaService.crear` | `ReservaServiceTest` |

Además: `publicar-alojamiento.html` (`POST /api/hospedajes`, `GET /api/ciudades`) y `mis-propiedades.html` (`GET /api/hospedajes/anfitrion/{id}`).

## Contrato de la API

Base: `http://localhost:8080/api`. Todas las respuestas son JSON. Los errores devuelven `{ "mensaje": "..." }` con el código HTTP correspondiente.

### Acceso

| Método | Ruta | Body | Respuesta | Errores |
|---|---|---|---|---|
| POST | `/auth/registro` | `{ nombre, apellido, email, password, rol }` | `201` Usuario | `400` datos inválidos, `409` email ya registrado |
| POST | `/auth/login` | `{ email, password }` | `200` Usuario | `401` correo o contraseña incorrectos |
| POST | `/auth/recuperar` | `{ email }` | `200` `{ codigo }` (se muestra en pantalla porque no se envían correos) | `404` email sin cuenta |
| POST | `/auth/restablecer` | `{ email, codigo, password }` | `200` `{ mensaje }` | `400` código incorrecto o vencido |
| POST | `/usuarios/{id}/cambiar-modo` | `{ rol: "huesped" \| "anfitrion" }` | `200` Usuario | `400`, `404` |

**Usuario:** `{ id, username, nombre, apellido, email, rol }`

### Alojamientos

| Método | Ruta | Body | Respuesta | Errores |
|---|---|---|---|---|
| GET | `/hospedajes` (opcional `?entrada=AAAA-MM-DD&salida=AAAA-MM-DD`) | — | `200` lista de Hospedaje activos; con fechas, solo los libres en esas fechas | `400` falta una fecha o la salida no es posterior |
| GET | `/hospedajes/{id}` | — | `200` Hospedaje | `404` |
| GET | `/hospedajes/anfitrion/{anfitrionId}` | — | `200` lista de Hospedaje | — |
| POST | `/hospedajes` | `{ anfitrionId, nombre, descripcion, ciudad, tipo, precioPorNoche, capacidad, habitaciones?, camas?, banos?, servicios[], imagenes[] }` | `201` Hospedaje | `400`, `403` si no es anfitrión, `404` |
| GET | `/ciudades` | — | `200` lista de nombres | — |
| PUT | `/hospedajes/{id}` | igual que publicar | `200` Hospedaje | `400`, `403` no es tuyo, `404` |
| POST | `/imagenes` | `multipart/form-data`, campo `archivo` (JPG/PNG/WEBP, hasta 5 MB) | `201` `{ url }` | `400` formato o tamaño |
| GET | `/imagenes/{id}` | — | `200` la imagen | `404` |
| POST | `/hospedajes/{id}/estado` | `{ anfitrionId, activo }` | `200` Hospedaje | `403` no es tuyo, `404` |
| DELETE | `/hospedajes/{id}?anfitrionId=N` | — | `204` | `403` no es tuyo, `409` tiene reservas activas |
| GET | `/servicios` | — | `200` lista de nombres | — |
| POST | `/servicios` | `{ nombre }` | `201` `{ nombre }` | `400` nombre vacío, `409` ya existe |
| GET | `/hospedajes/{id}/bloqueos` | — | `200` lista de Bloqueo | — |
| POST | `/hospedajes/{id}/bloqueos` | `{ anfitrionId, fechaDesde, fechaHasta, motivo? }` | `201` Bloqueo | `400` fechas inválidas, `403` no es tuyo, `409` hay reservas o ya está bloqueado |
| DELETE | `/bloqueos/{id}?anfitrionId=N` | — | `204` | `403` no es tuyo, `404` |

**Hospedaje:** `{ id, nombre, descripcion, ciudad, tipo, precioPorNoche, capacidad, habitaciones, camas, banos, imagen, imagenes[], servicios[], calificacion, resenas, destacado, anfitrion, anfitrionId, activo }`

**Bloqueo:** `{ id, fechaDesde, fechaHasta, motivo }` (las dos fechas incluidas)

### Reservas

| Método | Ruta | Body | Respuesta | Errores |
|---|---|---|---|---|
| POST | `/reservas` | `{ hospedajeId, usuarioId, fechaCheckIn, fechaCheckOut, huespedes }` | `201` Reserva | `400` fechas o capacidad, `403` si no es huésped, `404`, `409` fechas ocupadas |
| GET | `/reservas/usuario/{usuarioId}` | — | `200` lista de Reserva | — |
| GET | `/reservas/anfitrion/{anfitrionId}` | — | `200` lista de Reserva | — |
| GET | `/reservas/hospedaje/{hospedajeId}/ocupacion` | — | `200` lista de `{ fechaCheckIn, fechaCheckOut, tipo: "reserva" \| "bloqueo" }` | — |
| PUT | `/reservas/{id}/fechas` | `{ usuarioId, fechaCheckIn, fechaCheckOut }` | `200` Reserva (importe recalculado) | `400` fechas, `403` no es tuya, `409` ocupado o fuera de plazo |
| POST | `/reservas/{id}/cancelar` | `{ usuarioId, motivo }` | `200` Reserva | `403` no es tuya, `409` ya cancelada o fuera de plazo |
| POST | `/reservas/{id}/cancelar-anfitrion` | `{ anfitrionId, motivo }` | `200` Reserva | `400` sin motivo, `403` no es de tus alojamientos, `409` ya cancelada o fuera de plazo |

**Reserva:** `{ id, hospedajeId, hospedaje, ciudad, imagen, fechaCheckIn, fechaCheckOut, noches, huespedes, importeTotal, estado: "ACTIVA" | "CANCELADA", fechaCreacion, huesped, motivoCancelacion, canceladaPor: "HUESPED" | "ANFITRION" | null }`

## Reglas de negocio de la reserva (`ReservaService.crear`)

- La salida tiene que ser posterior a la entrada, y la entrada no puede ser anterior a hoy.
- Estadía máxima: 30 noches.
- Solo un usuario en modo huésped puede reservar.
- No se puede superar la capacidad del alojamiento.
- **No se puede reservar en fechas que se pisan con otra reserva activa ni en días bloqueados por el anfitrión** (`409`).
- No se puede reservar un alojamiento pausado. Las dos variantes están probadas en `backend/src/test/.../service/ReservaServiceTest.java` (JUnit + Mockito, sin base de datos).
- Importe total = precio por noche × noches.

## Flujo de trabajo

Un módulo a la vez: funciona en la pantalla → commit → tag (`m1-ok` … `m5-ok`). Cada módulo entra por un PR revisado por otro integrante.

## Fuera de alcance en esta entrega

- "Guardar cambios" en `perfil.html` no tiene backend todavía.

## Correcciones posteriores

- **Detalle:** visor de fotos con flechas (botones y teclado ← →), cruz en la esquina de la foto y estrellas debajo de la galería.
- **Calendario de reserva:** las fechas ocupadas se ven en rojo y no se pueden elegir ([flatpickr](https://flatpickr.js.org/)). La salida queda limitada hasta la próxima fecha ocupada.
- **Recuperar contraseña:** el backend genera un código de 6 dígitos (válido 10 minutos, de un solo uso) y, como no se envían correos, se muestra en pantalla.
- **Cancelación por el anfitrión:** desde "Reservas recibidas", con un motivo obligatorio que el huésped ve en "Mis reservas". Se guarda en la columna nueva `reserva.motivo_cancelacion`.
- **Servicios:** los extras del filtro del catálogo y de "Publicar" salen de la tabla `servicio`; el anfitrión puede agregar uno nuevo si no está.
- **Estrellas** debajo del nombre del alojamiento, más grandes.
- **Pausar / activar / eliminar alojamiento** desde "Mis propiedades" (columna nueva `hospedaje.activo`). Un alojamiento pausado no aparece en el catálogo ni se puede reservar. Solo se puede eliminar si no tiene reservas activas pendientes; al eliminarlo se borran también sus bloqueos y su historial de reservas.
- **Bloqueo de fechas** (`calendario.html`, tabla nueva `bloqueo`): el anfitrión elige un rango en el calendario y lo bloquea con un motivo opcional; también puede liberarlo. Los días bloqueados se ven en rojo en el calendario del huésped y el backend rechaza reservas sobre ellos.

- **Editar alojamiento** desde "Mis propiedades": abre el formulario de publicar con los datos cargados y guarda con `PUT`.
- **Fotos desde la computadora:** en publicar/editar se eligen archivos; el navegador los achica (máx. 1600 px, JPG) y los sube a `POST /api/imagenes`, que los guarda en la tabla nueva `imagen` (así los ve todo el grupo con la misma base de Neon). El alojamiento guarda la dirección `/api/imagenes/{id}` como cualquier otra foto. Vista previa con portada y botón para quitar.
- **Mis reservas (huésped):** cambiar las fechas (calendario con los días ocupados, se recalcula el importe) o cancelar con un motivo obligatorio, que el anfitrión ve en "Reservas recibidas" (columna nueva `reserva.cancelada_por`).
- El calendario de bloqueos se abre desde "Mis propiedades" → "Bloquear fechas" (ya no está en la barra).

En la base de Neon que ya existía hay que correr `schema.sql` una vez (o solo sus últimas líneas): crea las tablas `bloqueo` e `imagen` y agrega las columnas nuevas sin tocar los datos.

## Declaración de uso de IA

Modo asistido. Se consultó a un asistente de IA (Claude) para revisar qué partes seguían hardcodeadas, armar el script de la base con `validate`, y armar el endpoint de reservas recibidas (M5) y el test JUnit de la regla de superposición.
