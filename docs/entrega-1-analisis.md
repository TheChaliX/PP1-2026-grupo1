# Entrega 1 — Análisis del Sistema

**Grupo**: [TBMA]  
**Proyecto**: [Sistema de Reserva de Alojamiento]  
**Fecha de entrega**: 30/04/2026

---


## Actores del Sistema

## 1. Identificación de Actores
| Nombre | Rol / Función | Tipo |
|--------|--------------|------|
| Propietario | Publica alojamientos, gestiona reservas y disponibilidad | Usuario final |
| Huésped | Busca alojamientos y realiza reservas | Usuario final |
| Servicio de Notificaciones | Envía alertas automáticas a los usuarios | Servicio externo |

## 2. Requisitos Funcionales

| ID    | Descripción | Actor | HU relacionada |
|-------|-------------|-------|----------------|
| RF-01 |      El sistema debe permitir que el **huésped** se registre con correo electrónico y contraseña.        |     Huesped  |      HU-01    |
| RF-02 |      El sistema debe permitir que el **propietario** publique un alojamiento con fotos, precio y descripción.     |    Propietario  |    HU-02 | 
| RF-03 | El sistema debe permitir que el **huésped** busque alojamientos filtrando por ubicación, fechas y precio. | Huésped | HU-03 |
| RF-04 | El sistema debe permitir que el **huésped** realice una reserva seleccionando fechas disponibles. | Huésped | HU-04 |
| RF-05 | El sistema debe permitir que el **propietario** gestione sus reservas (aceptar, cancelar o rechazar reservas)  | Propietario | HU-05 |
| RF-06 | El sistema debe permitir que el huésped consulte disponibilidad de un alojamiento | Huésped | HU-06 |
| RF-07 | El sistema debe permitir que el propietario gestione el calendario de disponibilidad | Propietario | HU-07 |
| RF-08 | El sistema debe permitir que el huésped cancele una reserva | Huésped | HU-08 |
RF-09 | El sistema debe permitir validar reservas antes de confirmarlas | Sistema | HU-09
RF-10 | El sistema debe permitir enviar notificaciones automáticas ante eventos de reserva | Sistema | HU-10

> Cada requisito debe describir una acción concreta: "El sistema debe permitir que [actor] [acción]..."

## 3. Requisitos No Funcionales

| ID | Categoría | Descripción |
|----|----------|------------|
| RNF-01 | Rendimiento | El sistema debe responder búsquedas en menos de 3 segundos con hasta 50 usuarios concurrentes |
|RNF-02 | Seguridad | Las contraseñas deben almacenarse utilizando algoritmos de hash seguros (bcrypt o Argon2) con salting y no deben guardarse en texto plano|
| RNF-03 | Usabilidad | La interfaz debe adaptarse a dispositivos móviles y de escritorio manteniendo funcionalidad completa en ambos |
|RNF-04 | Portabilidad | El sistema debe ser compatible con las últimas versiones de navegadores modernos como Chrome, Firefox, Edge y Safari
|RNF-05 | Disponibilidad | El sistema debe mantener una disponibilidad mínima del 99% mensual, excluyendo períodos de mantenimiento programado
| RNF-06 | Integridad | El sistema debe impedir reservas con fechas superpuestas para una misma propiedad mediante validación transaccional |

---
## 4. Historias de Usuario

| ID    | Como...       | Quiero...                  | Para...                            |
|-------|---------------|----------------------------|------------------------------------|
| HU-01 | **Huesped**   | quiero registrarme con mi correo y contraseña | crear una cuenta que permita realizar reservas. |
| HU-02 | **Propietario**   | publicar mi alojamiento con fotos, precios y descripcion | que los huespedes puedan conocerlo y reservarlo. |
| HU-03 | **Huesped**   | buscar alojamiento filtrando por ubicacion, fechas y precios | encontrar opciones que se ajusten a mis planes y presupuesto. |
| HU-04 | **Huesped** | realizar reserva seleccionando fechas disponibles | asegurar mi estadia en el alojamiento que elijo. |
| HU-05 | **Propietario** | gestionar las reservas de mi alojamiento | aceptar, rechazar o hacer seguimiento de las estadias confirmadas. |
| HU-06 | Huésped | consultar el calendario de disponibilidad de un alojamiento | conocer qué fechas están libres, ocupadas o bloqueadas |
| HU-07 | Propietario | gestionar el calendario de disponibilidad de mis alojamientos | bloquear o liberar fechas según mis necesidades |
| HU-08 | Huésped | cancelar una reserva existente | liberar las fechas y desistir de la estadía |
| HU-09 | Huésped | que el sistema valide mi reserva antes de confirmarla | evitar errores o conflictos en la reserva |
| HU-10 | Huésped | recibir notificaciones sobre el estado de mis reservas | mantenerme informado sin ingresar constantemente al sistema |
## 5. Diagrama de Casos de Uso

> Insertar imagen del diagrama exportado desde Draw.io, Lucidchart, StarUML o similar.  
> Guardar la imagen en esta misma carpeta (`docs/`) y referenciarla abajo.

![Diagrama de Casos de Uso](https://github.com/TheChaliX/PP1-2026-grupo1/blob/main/docs/Casos%20de%20Usos%20Reserva.drawio11.png)


## 6. Especificación de Casos de Uso

---

### CU-01 — Realizar reserva

| Campo | Detalle |
|------|--------|
| Actor principal | Huésped |
| Descripción | El huésped realiza una reserva sobre un alojamiento seleccionando fechas disponibles |
| Precondiciones | - Usuario autenticado<br>- Alojamiento existente |
| Postcondiciones | - Reserva registrada<br>- Fechas ocupadas<br>- Notificación enviada |

| Secuencia Normal | Excepciones |
|------------------|------------|
| 1. El huésped busca un alojamiento | |
| 2. El sistema muestra resultados | |
| 3. El huésped selecciona un alojamiento | |
| 4. <<include>> Consultar disponibilidad | |
| 5. El huésped selecciona fechas | 5.1 Si las fechas no están disponibles, el sistema informa el error |
| 6. El sistema calcula el total (precio × noches) | |
| 7. El sistema valida la reserva | 7.1 Si la validación falla, el sistema informa el motivo |
| 8. El huésped confirma la reserva | |
| 9. El sistema registra la reserva | |
| 10. El sistema invoca al Servicio de Notificaciones | |

---

### CU-02 — Publicar alojamiento

| Campo | Detalle |
|------|--------|
| Actor principal | Propietario |
| Descripción | El propietario publica un alojamiento en la plataforma |
| Precondiciones | - Usuario autenticado |
| Postcondiciones | - Alojamiento registrado y visible |

| Secuencia Normal | Excepciones |
|------------------|------------|
| 1. El propietario accede a publicar alojamiento | |
| 2. El sistema muestra el formulario | |
| 3. El propietario ingresa datos | 3.1 Si faltan datos obligatorios, el sistema solicita completarlos |
| 4. El propietario confirma | |
| 5. El sistema valida datos | 5.1 Si hay errores, el sistema informa |
| 6. El sistema registra el alojamiento | |
| 7. El sistema muestra el alojamiento | |

---

### CU-03 — Buscar alojamiento

| Campo | Detalle |
|------|--------|
| Actor principal | Huésped |
| Descripción | Permite buscar alojamientos aplicando filtros |
| Precondiciones | - Existencia de alojamientos |
| Postcondiciones | - Lista de resultados mostrada |

| Secuencia Normal | Excepciones |
|------------------|------------|
| 1. El huésped accede a búsqueda | |
| 2. El sistema muestra filtros | |
| 3. El huésped ingresa criterios | |
| 4. El huésped ejecuta la búsqueda | |
| 5. El sistema procesa | |
| 6. El sistema muestra resultados | 6.1 Si no hay resultados, el sistema informa |

---

### CU-04 — Aceptar / cancelar reserva entrante

| Campo | Detalle |
|------|--------|
| Actor principal | Propietario |
| Descripción | El propietario gestiona reservas recibidas |
| Precondiciones | - Existen reservas |
| Postcondiciones | - Estado actualizado<br>- Notificación enviada |

| Secuencia Normal | Excepciones |
|------------------|------------|
| 1. El propietario accede a reservas | |
| 2. El sistema muestra reservas | |
| 3. Selecciona una reserva | |
| 4. Elige acción (aceptar o cancelar) | |
| 5. El sistema procesa | 5.1 Si ocurre un error, el sistema informa |
| 6. El sistema actualiza estado | |
| 7. Si cancela, el sistema libera las fechas | |
| 8. El sistema invoca notificaciones | |

---

### CU-05 — Consultar disponibilidad

| Campo | Detalle |
|------|--------|
| Actor principal | Huésped |
| Descripción | Permite visualizar el calendario de disponibilidad |
| Precondiciones | - Alojamiento existente |
| Postcondiciones | - Calendario visible |

| Secuencia Normal | Excepciones |
|------------------|------------|
| 1. El huésped selecciona un alojamiento | |
| 2. El sistema muestra el calendario con fechas libres, ocupadas y bloqueadas | |

---

### CU-06 — Cancelar reserva

| Campo | Detalle |
|------|--------|
| Actor principal | Huésped |
| Descripción | Permite cancelar una reserva existente |
| Precondiciones | - Reserva existente |
| Postcondiciones | - Reserva cancelada<br>- Fechas liberadas |

| Secuencia Normal | Excepciones |
|------------------|------------|
| 1. El huésped accede a sus reservas | |
| 2. Selecciona una reserva | |
| 3. Confirma cancelación | |
| 4. El sistema actualiza estado | 4.1 Si ocurre un error, el sistema informa |
| 5. El sistema libera las fechas | |
| 6. El sistema invoca notificaciones | |

---

### CU-07 — Gestionar calendario de disponibilidad

| Campo | Detalle |
|------|--------|
| Actor principal | Propietario |
| Descripción | Permite bloquear o liberar fechas |
| Precondiciones | - Alojamiento existente |
| Postcondiciones | - Calendario actualizado |

| Secuencia Normal | Excepciones |
|------------------|------------|
| 1. El propietario accede al calendario | |
| 2. Selecciona fechas | |
| 3. Define acción (bloquear o liberar) | |
| 4. El sistema actualiza calendario | 4.1 Si hay reservas confirmadas, no permite modificar |

---

### CU-08 — Validar reserva

| Campo | Detalle |
|------|--------|
| Actor principal | Sistema |
| Descripción | Valida condiciones antes de confirmar una reserva |
| Precondiciones | - Datos de reserva disponibles |
| Postcondiciones | - Resultado de validación |

| Secuencia Normal | Excepciones |
|------------------|------------|
| 1. 1. El sistema recibe la solicitud desde CU-01 Realizar reserva| |
| 2. Verifica disponibilidad | |
| 3. Verifica estado del alojamiento | |
| 4. Verifica capacidad | |
| 5. Retorna resultado | 5.1 Si falla alguna validación, retorna el motivo |

> Repetir la ficha completa para cada caso de uso del diagrama.
> Las excepciones se numeran ligadas al paso del que se desvían (ej: 4.1 en la misma fila que el paso 4).
