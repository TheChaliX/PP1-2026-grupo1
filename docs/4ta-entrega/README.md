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
| POST | `/usuarios/{id}/cambiar-modo` | `{ rol: "huesped" \| "anfitrion" }` | `200` Usuario | `400`, `404` |

**Usuario:** `{ id, username, nombre, apellido, email, rol }`

### Alojamientos

| Método | Ruta | Body | Respuesta | Errores |
|---|---|---|---|---|
| GET | `/hospedajes` | — | `200` lista de Hospedaje | — |
| GET | `/hospedajes/{id}` | — | `200` Hospedaje | `404` |
| GET | `/hospedajes/anfitrion/{anfitrionId}` | — | `200` lista de Hospedaje | — |
| POST | `/hospedajes` | `{ anfitrionId, nombre, descripcion, ciudad, tipo, precioPorNoche, capacidad, habitaciones?, camas?, banos?, servicios[], imagenes[] }` | `201` Hospedaje | `400`, `403` si no es anfitrión, `404` |
| GET | `/ciudades` | — | `200` lista de nombres | — |

**Hospedaje:** `{ id, nombre, descripcion, ciudad, tipo, precioPorNoche, capacidad, habitaciones, camas, banos, imagen, imagenes[], servicios[], calificacion, resenas, destacado, anfitrion, anfitrionId }`

### Reservas

| Método | Ruta | Body | Respuesta | Errores |
|---|---|---|---|---|
| POST | `/reservas` | `{ hospedajeId, usuarioId, fechaCheckIn, fechaCheckOut, huespedes }` | `201` Reserva | `400` fechas o capacidad, `403` si no es huésped, `404`, `409` fechas ocupadas |
| GET | `/reservas/usuario/{usuarioId}` | — | `200` lista de Reserva | — |
| GET | `/reservas/anfitrion/{anfitrionId}` | — | `200` lista de Reserva | — |
| GET | `/reservas/hospedaje/{hospedajeId}/ocupacion` | — | `200` lista de `{ fechaCheckIn, fechaCheckOut }` | — |
| POST | `/reservas/{id}/cancelar` | `{ usuarioId }` | `200` Reserva | `403` no es tuya, `409` ya cancelada o fuera de plazo |

**Reserva:** `{ id, hospedajeId, hospedaje, ciudad, imagen, fechaCheckIn, fechaCheckOut, noches, huespedes, importeTotal, estado: "ACTIVA" | "CANCELADA", fechaCreacion, huesped }`

## Reglas de negocio de la reserva (`ReservaService.crear`)

- La salida tiene que ser posterior a la entrada, y la entrada no puede ser anterior a hoy.
- Estadía máxima: 30 noches.
- Solo un usuario en modo huésped puede reservar.
- No se puede superar la capacidad del alojamiento.
- **No se puede reservar en fechas que se pisan con otra reserva activa** (`409`). Esta regla está probada en `backend/src/test/.../service/ReservaServiceTest.java` (JUnit + Mockito, sin base de datos).
- Importe total = precio por noche × noches.

## Flujo de trabajo

Un módulo a la vez: funciona en la pantalla → commit → tag (`m1-ok` … `m5-ok`). Cada módulo entra por un PR revisado por otro integrante.

## Fuera de alcance en esta entrega

- `calendario.html` (bloqueo de días) quedó como maqueta y se sacó de la barra de navegación.
- `recuperar.html` y "Guardar cambios" en `perfil.html` no tienen backend todavía.

## Declaración de uso de IA

Modo asistido. Se consultó a un asistente de IA (Claude) para revisar qué partes seguían hardcodeadas, armar el script de la base con `validate`, y armar el endpoint de reservas recibidas (M5) y el test JUnit de la regla de superposición.
