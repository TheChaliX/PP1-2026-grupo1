# Entrega final: Exposición

**Materia:** Práctica Profesionalizante I (PP1) — 2026
**Proyecto:** AlojAR — Sistema de reservas de alojamientos
**Grupo:** Grupo 1 — Sarco Thiago, Nanzer Benjamin, Chalita Antonio y Hernandes German Mateo
**Fecha de la mesa:** 01/12/2026 (final del 2do llamado de diciembre)

Este README parte de lo entregado en la [Entrega 4](../4ta-entrega/README.md) y suma lo que fuimos cambiando para la exposición final, a partir de la devolución del docente.

## Cómo levantarlo

1. **Base (PostgreSQL en Neon):** la estructura está en `backend/db/schema.sql`. Se corre desde el SQL Editor de Neon. Usa `CREATE TABLE IF NOT EXISTS` y `ADD COLUMN IF NOT EXISTS`, así que sobre la base actual no borra nada y en una base vacía crea todas las tablas.
2. **Backend:** definir las tres variables de entorno y correr `OpenlodgeApplication`.
   - IntelliJ: *Run → Edit Configurations → Environment variables*.
   - `DB_URL`: dirección JDBC de la base de Neon.
   - `DB_USER`: usuario de la base.
   - `DB_PASSWORD`: contraseña de la base.
   - Los valores los tiene el grupo; ninguno está en el repo. Las tres son obligatorias: si falta alguna, el backend no arranca.
   - Si las tablas están vacías, al arrancar el backend carga los datos iniciales.
3. **Frontend:** abrir `frontend/index.html` con Live Server (puerto 5500). La dirección del backend está en una sola constante: `API_BASE` en `assets/js/sesion.js`.

La estructura de la base la define el script; Hibernate corre con `ddl-auto=validate` y solo verifica que coincida con las entidades.

**Base:** se usa PostgreSQL alojado en Neon (en la nube) en lugar de MySQL local, con el visto bueno del docente.

## Pantallas y módulos

| Módulo | Pantalla | JS | Endpoints principales | Tablas |
|---|---|---|---|---|
| **Acceso** | `login.html`, `registro.html`, `recuperar.html` | `login.js`, `registro.js`, `recuperar.js`, `sesion.js` | `/api/auth/*`, `POST /api/usuarios/{id}/cambiar-modo` | `usuario`, `tipo_usuario` |
| **Buscar** | `catalogo.html` | `catalogo.js` | `GET /api/hospedajes`, `GET /api/servicios` | `hospedaje`, `ciudad`, `servicio_hospedaje`, `servicio`, `hospedaje_imagen`, `reserva`, `bloqueo` |
| **Detalle** | `detalle.html?id=N` | `detalle.js` | `GET /api/hospedajes/{id}`, `GET /api/reservas/hospedaje/{id}/ocupacion` | `hospedaje` (+ las de Buscar), `reserva`, `bloqueo` |
| **Reservar** | `detalle.html` (formulario) | `detalle.js` | `POST /api/reservas` | `reserva` |
| **Mis reservas (huésped)** | `reservas.html` | `reservas.js` | `GET /api/reservas/usuario/{id}`, `PUT /api/reservas/{id}/fechas`, `POST /api/reservas/{id}/cancelar` | `reserva` |
| **Reservas recibidas (anfitrión)** | `reservas-recibidas.html` | `reservas-recibidas.js` | `GET /api/reservas/anfitrion/{id}`, `POST /api/reservas/{id}/cancelar-anfitrion` | `reserva` ⨝ `hospedaje` ⨝ `usuario` |
| **Mis propiedades** | `mis-propiedades.html` | `mis-propiedades.js` | `GET /api/hospedajes/anfitrion/{id}`, `POST /api/hospedajes/{id}/estado`, `DELETE /api/hospedajes/{id}` | `hospedaje` |
| **Publicar / editar** | `publicar-alojamiento.html` | `publicar-alojamiento.js` | `POST` y `PUT /api/hospedajes`, `POST /api/imagenes`, `GET /api/ciudades` | `hospedaje`, `hospedaje_imagen`, `imagen`, `servicio_hospedaje` |
| **Bloquear fechas** | `calendario.html` | `calendario.js` | `/api/hospedajes/{id}/bloqueos`, `DELETE /api/bloqueos/{id}` | `bloqueo` |
| **Perfil** | `perfil.html` | `perfil.js` | — | — |

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
| PUT | `/reservas/{id}/fechas` | `{ usuarioId, fechaCheckIn, fechaCheckOut, motivo }` | `200` Reserva (importe recalculado) | `400` fechas o sin motivo, `403` no es tuya, `409` ocupado o fuera de plazo |
| POST | `/reservas/{id}/cancelar` | `{ usuarioId, motivo }` | `200` Reserva | `403` no es tuya, `409` ya cancelada o fuera de plazo |
| POST | `/reservas/{id}/cancelar-anfitrion` | `{ anfitrionId, motivo }` | `200` Reserva | `400` sin motivo, `403` no es de tus alojamientos, `409` ya cancelada o fuera de plazo |

**Reserva:** `{ id, hospedajeId, hospedaje, ciudad, imagen, fechaCheckIn, fechaCheckOut, noches, huespedes, importeTotal, estado: "ACTIVA" | "CANCELADA", fechaCreacion, huesped, motivoCancelacion, canceladaPor: "HUESPED" | "ANFITRION" | null, motivoCambioFechas }`

## Reglas de negocio de la reserva (`ReservaService.crear`)

- La salida tiene que ser posterior a la entrada, y la entrada no puede ser anterior a hoy.
- Estadía máxima: 30 noches.
- Solo un usuario en modo huésped puede reservar.
- No se puede superar la capacidad del alojamiento.
- **No se puede reservar en fechas que se pisan con otra reserva activa ni en días bloqueados por el anfitrión** (`409`).
- No se puede reservar un alojamiento pausado. Las variantes están probadas en `backend/src/test/.../service/ReservaServiceTest.java` (JUnit + Mockito, sin base de datos).
- Importe total = precio por noche × noches.
- La reserva es inmediata: si las fechas están libres, queda confirmada sin que el anfitrión la acepte. El anfitrión controla su disponibilidad bloqueando fechas, y puede cancelar una reserva con un motivo. El cambio de fechas del huésped funciona igual: si las fechas nuevas están libres, se aplica al momento, con un motivo obligatorio que ve el anfitrión.

## Cambios desde la Entrega 4

| Cambio | Qué se cambió |
|---|---|
| Confirmar al eliminar un alojamiento | En "Mis propiedades", el aviso del navegador ("localhost dice...") se reemplazó por un cartel propio de la página, igual al de pausar. También se arregló el botón "Eliminar", que al pasar el mouse dejaba el texto invisible. |
| Motivo al cambiar fechas | Cuando el huésped cambia las fechas de una reserva, tiene que escribir un motivo (obligatorio, hasta 500 caracteres). El anfitrión lo ve en "Reservas recibidas" y el huésped en "Mis reservas". Columna nueva `reserva.motivo_cambio_fechas`. |
| Estado de las reservas según las fechas | En "Mis reservas" y "Reservas recibidas" una reserva confirmada ahora dice "En curso" mientras dura la estadía y "Finalizada" cuando ya pasó (antes el anfitrión veía "Confirmada" en reservas pasadas). El filtro de estado de "Reservas recibidas" suma esas dos opciones. También se arregló el cartel de estado, que se estiraba al lado del botón "Cancelar reserva". |
| Contraseña de Neon | Se generó una contraseña nueva, porque la vieja seguía en el historial de git. `DB_URL` y `DB_USER` ya no tienen valor por defecto en `application.properties`: ahora las tres variables son obligatorias. |

## Guion de la demo

1. Registrar un usuario en vivo.
2. Buscar un alojamiento (con fechas y filtros) y entrar al detalle.
3. Reservar y verlo en "Mis reservas".
4. Mostrar esa misma reserva del lado del anfitrión ("Reservas recibidas"), con la cuenta demo o cambiando de modo.
5. Mostrar una validación que rechace: fechas al revés o más huéspedes que la capacidad.
6. Recorrer un módulo de la pantalla a la tabla: botón → JS → endpoint → controller → service → repositorio → tabla.

## Declaración de uso de IA

Modo asistido. Se consultó a un asistente de IA (Claude) para organizar los pendientes de la devolución y armar este README.
