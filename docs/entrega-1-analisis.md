# Entrega 1 — Análisis del Sistema

**Grupo**: [TBMA]  
**Proyecto**: [Sistema de Reserva de Alojamiento]  
**Fecha de entrega**: 30/04/2026

---

## 1. Identificación de Actores

## Actores del Sistema

## 1. Identificación de Actores
| Nombre                  | Rol / Función                                                                 | Tipo                     |
|------------------------|------------------------------------------------------------------------------|--------------------------|
| Propietario            | Publica alojamientos, los edita o elimina, y gestiona las reservas recibidas.| Usuario final            |
| Huésped                | Busca alojamientos, realiza reservas, puede cancelarlas, ver su historial y dejar reseñas. | Usuario final |
| Administrador          | Supervisa usuarios y alojamientos dentro de la plataforma y gestiona el funcionamiento general del sistema. | Usuario interno del sistema |
| Sistema de Notificaciones | Envía alertas y mensajes automáticos a los usuarios (confirmaciones, cancelaciones, recordatorios, etc.). | Sistema externo |

## 2. Requisitos Funcionales

| ID    | Descripción | Actor | HU relacionada |
|-------|-------------|-------|----------------|
| RF-01 |      El sistema debe permitir que el **huésped** se registre con correo electrónico y contraseña.        |     Huesped  |      HU-01    |
| RF-02 |      El sistema debe permitir que el **propietario** publique un alojamiento con fotos, precio y descripción.     |    Propietario  |    HU-02 | 
| RF-03 | El sistema debe permitir que el **huésped** busque alojamientos filtrando por ubicación, fechas y precio. | Huésped | HU-03 |
| RF-04 | El sistema debe permitir que el **huésped** realice una reserva seleccionando fechas disponibles. | Huésped | HU-04 |
| RF-05 | El sistema debe permitir que el **propietario** gestione sus reservas  | Propietario | HU-05 |
| RF-06 | El sistema debe permitir que el **huésped** deje una reseña | Huésped | HU-06 |
| RF-07 | El sistema debe permitir que el **administrador** supervise usuarios y alojamientos para garantizar cumplimiento de normas. | Administrador | HU-07 |
> Cada requisito debe describir una acción concreta: "El sistema debe permitir que [actor] [acción]..."

## 3. Requisitos No Funcionales

| ID     | Categoría (rendimiento, seguridad, usabilidad, etc.) | Descripción |
|--------|------------------------------------------------------|-------------|
| RNF-01 | rendimiento  |    El sistema debe responder rapido ante cualquier consulta         |
| RNF-02 | Seguridad    |   Las contraseñas deben almacenarse en formato **encriptado**   |
| RNF-03 | Usabilidad | La interfaz debe estar disponible en **español** y ser accesible desde dispositivos móviles. |
| RNF-04 | Portabilidad | El sistema debe poder ejecutarse en navegadores modernos (Chrome, Edge, Firefox, Safari). |

## 4. Historias de Usuario

| ID    | Como...       | Quiero...                  | Para...                            |
|-------|---------------|----------------------------|------------------------------------|
| HU-01 | **Huesped**   | quiero registrarme con mi correo y contraseña | crear una cuenta que permita realizar reservas. |
| HU-02 | **Propietario**   | publicar mi alojamiento con fotos, precios y descripcion | que los huespedes puedan conocerlo y reservarlo. |
| HU-03 | **Huesped**   | buscar alojamiento filtrando por ubicacion, fechas y precios | encontrar opciones que se ajusten a mis planes y presupuesto. |
| HU-04 | **Huesped** | realizar reserva seleccionando fechas disponibles | asegurar mi estadia en el alojamiento que elijo. |
| HU-05 | **Propietario** | gestionar las reservas de mi alojamieto | aceptar, rechazar o hacer seguimiento de las estadias confirmadas. |
| HU-06 | **Huesped** | dejar una reseña sobre el alojamiento donde me hospede | compartir mi experiencia y ayudar a otros viajeros a elegir. |
| HU-07 | **Administrador** | supervisar los usarios y alojamientos de la plataforma | garantizar el cumplimientos de las normas de la comunidad. |
## 5. Diagrama de Casos de Uso

> Insertar imagen del diagrama exportado desde Draw.io, Lucidchart, StarUML o similar.  
> Guardar la imagen en esta misma carpeta (`docs/`) y referenciarla abajo.

![Diagrama de Casos de Uso](https://raw.githubusercontent.com/TheChaliX/PP1-2026-grupo1/f49655e1e369cac01bae9319977e2fd37c8387c3/docs/Casos%20de%20Usos%20Reserva.drawio.png)

## 6. Especificación de Casos de Uso

### CU-01 — [Nombre del caso de uso]

| Campo | Detalle |
|---|---|
| **Actor principal** | |
| **Descripción** | |
| **Precondiciones** | |
| **Postcondiciones (criterios de aceptación)** | |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|---|---|
| 1.  |  |
| 2.  |  |
| 3.  |  |

---

> Repetir la ficha completa para cada caso de uso del diagrama.
> Las excepciones se numeran ligadas al paso del que se desvían (ej: 4.1 en la misma fila que el paso 4).
