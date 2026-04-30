# Entrega 1 — Análisis del Sistema

**Grupo**: [TBMA]  
**Proyecto**: [Sistema de Reserva de Alojamiento]  
**Fecha de entrega**: 30/04/2026

---


## Actores del Sistema

## 1. Identificación de Actores
| Nombre                  | Rol / Función                                                                 | Tipo                     |
|------------------------|------------------------------------------------------------------------------|--------------------------|
| Propietario            | Publica alojamientos, los edita o elimina, y gestiona las reservas recibidas.| Usuario final            |
| Huésped                | Busca alojamientos, realiza reservas, puede cancelarlas, ver su historial y dejar reseñas. | Usuario final |
| Administrador          | Supervisa usuarios y alojamientos dentro de la plataforma y gestiona el funcionamiento general del sistema. | Usuario interno del sistema |
| Servicio de Notificaciones | Envía alertas y mensajes automáticos a los usuarios (confirmaciones, cancelaciones, recordatorios, etc.). | Servicio externo |

## 2. Requisitos Funcionales

| ID    | Descripción | Actor | HU relacionada |
|-------|-------------|-------|----------------|
| RF-01 |      El sistema debe permitir que el **huésped** se registre con correo electrónico y contraseña.        |     Huesped  |      HU-01    |
| RF-02 |      El sistema debe permitir que el **propietario** publique un alojamiento con fotos, precio y descripción.     |    Propietario  |    HU-02 | 
| RF-03 | El sistema debe permitir que el **huésped** busque alojamientos filtrando por ubicación, fechas y precio. | Huésped | HU-03 |
| RF-04 | El sistema debe permitir que el **huésped** realice una reserva seleccionando fechas disponibles. | Huésped | HU-04 |
| RF-05 | El sistema debe permitir que el **propietario** gestione sus reservas (aceptar, cancelar o rechazar reservas)  | Propietario | HU-05 |
| RF-06 | El sistema debe permitir que el **huésped** deje una reseña post estadia | Huésped | HU-06 |
| RF-07 | El sistema debe permitir que el **administrador** supervise usuarios y alojamientos para garantizar cumplimiento de normas. | Administrador | HU-07 |
| RF-08 | El sistema debe enviar una notificacion automatica al huesped y propietario a traves del servicio externo, cuando cambie el estado de una reserva  | Servicio de notificaciones | HU-08 |
| RF-09 | El sistema debe enviar una notificacion automatica al huesped 24 hs antes de su alojamiento | Servicio de notificaciones | HU-09 |

> Cada requisito debe describir una acción concreta: "El sistema debe permitir que [actor] [acción]..."

## 3. Requisitos No Funcionales

| ID | Categoría | Descripción |
|----|----------|------------|
| RNF-01 | Rendimiento | El sistema debe procesar la búsqueda de alojamientos en un tiempo menor a 3 segundos bajo una carga de hasta 50 usuarios concurrentes. |
| RNF-02 | Seguridad | Las contraseñas deben almacenarse utilizando algoritmos de hash seguros (por ejemplo, bcrypt o Argon2) con salting, y no deben guardarse en texto plano. |
| RNF-03 | Usabilidad | La interfaz debe estar disponible en idioma español y ser responsive, permitiendo su uso en dispositivos móviles y de escritorio. |
| RNF-04 | Portabilidad | El sistema debe ser compatible con navegadores modernos como Chrome, Edge, Firefox y Safari en sus últimas versiones. |
| RNF-05 | Disponibilidad | El sistema debe soportar al menos 500 usuarios diarios con una disponibilidad mínima del 99% mensual. |

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
| HU-08 | **Huesped** | recibir notificaciones sobre el estado de mi reserva | estar informado sin entrar a la plataforma. |
| HU-09 | **Huesped** | recibir notificaciones 24hs antes de mi estadia | organizar mi viaje. |
## 5. Diagrama de Casos de Uso

> Insertar imagen del diagrama exportado desde Draw.io, Lucidchart, StarUML o similar.  
> Guardar la imagen en esta misma carpeta (`docs/`) y referenciarla abajo.

![Diagrama de Casos de Uso](https://github.com/TheChaliX/PP1-2026-grupo1/blob/main/docs/Casos%20de%20Usos%20Reserva.drawio11.png)


## 6. Especificación de Casos de Uso

### CU-01 — Realizar reserva de alojamiento

| Campo | Detalle |
|------|--------|
| **Actor principal** | Huésped |
| **Descripción** | El huésped selecciona un alojamiento disponible y realiza una reserva indicando las fechas deseadas. |
| **Precondiciones** | - El huésped debe estar registrado e iniciar sesión.<br>- Deben existir alojamientos publicados.<br>- El alojamiento seleccionado debe tener fechas disponibles. |
| **Postcondiciones (criterios de aceptación)** | - La reserva queda registrada en el sistema.<br>- Se asocia al huésped y al alojamiento correspondiente.<br>- Se realiza el pago correctamente.<br>- Se envía una notificación de confirmación al huésped y al propietario. |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El huésped busca un alojamiento filtrando por ubicación, fechas y precio. | |
| 2. El sistema muestra una lista de alojamientos disponibles. | |
| 3. El huésped selecciona un alojamiento. | |
| 4. El huésped elige las fechas disponibles. | 4.1 Si las fechas no están disponibles, el sistema informa el error y solicita seleccionar otras. |
| 5. El sistema verifica calendario de reservas activas con fechas solicitadas. | |
| 6. El huésped confirma la reserva. | |
| 7. El sistema solicita y procesa el pago. | 7.1 Si el pago es rechazado, el sistema informa el error y permite reintentar. |
| 8. El sistema registra la reserva. | |
| 9. El sistema envía una notificación de confirmación. | |
---
### CU-02 — Publicar alojamiento

| Campo | Detalle |
|------|--------|
| **Actor principal** | Propietario |
| **Descripción** | El propietario publica un alojamiento ingresando información como fotos, precio y descripción. |
| **Precondiciones** | - El propietario debe estar registrado e iniciar sesión. |
| **Postcondiciones (criterios de aceptación)** | - El alojamiento queda registrado en el sistema.<br>- El alojamiento es visible para los huéspedes. |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El propietario accede a la opción de publicar alojamiento. | |
| 2. El sistema muestra el formulario de carga. | |
| 3. El propietario ingresa datos (fotos, precio, descripción, ubicación). | 3.1 Si falta información obligatoria, el sistema solicita completarla. |
| 4. El propietario confirma la publicación. | |
| 5. El sistema valida los datos. | 5.1 Si hay errores en los datos, el sistema informa y solicita corrección. |
| 6. El sistema registra el alojamiento. | |
| 7. El sistema muestra el alojamiento publicado. | |

### CU-03 — Buscar alojamiento

| Campo | Detalle |
|------|--------|
| **Actor principal** | Huésped |
| **Descripción** | El huésped busca alojamientos disponibles aplicando filtros como ubicación, fechas y precio. |
| **Precondiciones** | - Deben existir alojamientos cargados en el sistema. |
| **Postcondiciones (criterios de aceptación)** | - El sistema muestra una lista de alojamientos que cumplen con los criterios de búsqueda. |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El huésped accede a la opción de búsqueda. | |
| 2. El sistema muestra los filtros disponibles. | |
| 3. El huésped ingresa criterios (ubicación, fechas, precio). | |
| 4. El huésped ejecuta la búsqueda. | |
| 5. El sistema procesa la solicitud. | |
| 6. El sistema muestra los resultados. | 6.1 Si no hay resultados, el sistema informa que no se encontraron alojamientos. |

### CU-04 — Gestionar reservas

| Campo | Detalle |
|------|--------|
| **Actor principal** | Propietario |
| **Descripción** | El propietario visualiza y gestiona las reservas de sus alojamientos (aceptar, rechazar o cancelar). |
| **Precondiciones** | - El propietario debe estar registrado e iniciar sesión.<br>- Deben existir reservas realizadas. |
| **Postcondiciones (criterios de aceptación)** | - El estado de la reserva se actualiza correctamente.<br>- Se notifica al huésped sobre el cambio. |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El propietario accede a la sección de reservas. | |
| 2. El sistema muestra las reservas recibidas. | |
| 3. El propietario selecciona una reserva. | |
| 4. El propietario elige una acción (aceptar, rechazar o cancelar). | |
| 5. El sistema procesa la acción. | 5.1 Si ocurre un error, el sistema informa y no realiza el cambio. |
| 6. El sistema actualiza el estado de la reserva. | |
| 7. El sistema envía una notificación al huésped. | |

### CU-05 — Registrarse e iniciar sesión

| Campo | Detalle |
|------|--------|
| Actor principal | Huésped / Propietario |
| Descripción | El usuario se registra en la plataforma con correo y contraseña, y luego inicia sesión. |
| Precondiciones | - El usuario no debe estar registrado previamente (para registro). |
| Postcondiciones (criterios de aceptación) | - El usuario queda autenticado en el sistema. |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|---------------------------|
| 1. El usuario accede a la opción de registro/inicio de sesión. | |
| 2. El sistema muestra el formulario. | |
| 3. El usuario ingresa correo y contraseña. | 3.1 Si los datos son inválidos, el sistema informa el error. |
| 4. El usuario confirma. | |
| 5. El sistema valida los datos. | 5.1 Si el usuario no existe (login), el sistema informa. |
| 6. El sistema inicia sesión. | |

### CU-06 — Realizar pago

| Campo | Detalle |
|------|--------|
| Actor principal | Huésped |
| Descripción | El huésped realiza el pago correspondiente a la reserva. |
| Precondiciones | - Debe existir una reserva pendiente de pago. |
| Postcondiciones (criterios de aceptación) | - El pago queda registrado como aprobado. |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|---------------------------|
| 1. El sistema solicita los datos de pago. | |
| 2. El huésped ingresa los datos. | |
| 3. El sistema procesa el pago. | 3.1 Si el pago es rechazado, se informa el error. |
| 4. El sistema confirma el pago. | |

### CU-07 — Enviar correo de confirmación

| Campo | Detalle |
|------|--------|
| Actor principal | Plataforma de confirmación (sistema externo) |
| Descripción | El sistema envía un correo de confirmación al huésped y al propietario luego de una reserva. |
| Precondiciones | - La reserva debe estar confirmada. |
| Postcondiciones (criterios de aceptación) | - Los usuarios reciben la notificación por correo. |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|---------------------------|
| 1. El sistema genera el mensaje de confirmación. | |
| 2. El sistema envía el correo. | 2.1 Si falla el envío, se reintenta. |
| 3. El usuario recibe el correo. | |


### CU-08 — Dejar reseña

| Campo | Detalle |
|------|--------|
| Actor principal | Huésped |
| Descripción | El huésped deja una reseña sobre el alojamiento luego de su estadía. |
| Precondiciones | - El huésped debe haber completado una reserva. |
| Postcondiciones (criterios de aceptación) | - La reseña queda registrada y visible. |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|---------------------------|
| 1. El huésped accede a la opción de reseñar. | |
| 2. El sistema muestra el formulario. | |
| 3. El huésped ingresa comentario y calificación. | 3.1 Si falta información, el sistema solicita completarla. |
| 4. El huésped envía la reseña. | |
| 5. El sistema la registra. | |

### CU-09 — Supervisar usuarios y alojamientos

| Campo | Detalle |
|------|--------|
| Actor principal | Administrador |
| Descripción | El administrador supervisa y gestiona usuarios y alojamientos dentro de la plataforma. |
| Precondiciones | - El administrador debe iniciar sesión. |
| Postcondiciones (criterios de aceptación) | - Los cambios quedan registrados en el sistema. |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|---------------------------|
| 1. El administrador accede al panel de control. | |
| 2. El sistema muestra usuarios y alojamientos. | |
| 3. El administrador selecciona un elemento. | |
| 4. El administrador realiza una acción (bloquear, eliminar, etc.). | 4.1 Si ocurre un error, el sistema informa. |
| 5. El sistema guarda los cambios. | |

> Repetir la ficha completa para cada caso de uso del diagrama.
> Las excepciones se numeran ligadas al paso del que se desvían (ej: 4.1 en la misma fila que el paso 4).
