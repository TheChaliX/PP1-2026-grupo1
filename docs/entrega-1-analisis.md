# Entrega 1 — Análisis del Sistema

**Grupo**: [TBMA]  
**Proyecto**: [Sistema de Reserva de Alojamiento]  
**Fecha de entrega**: 30/04/2026

---

## 1. Identificación de Actores

| Actor | Rol / Función en el sistema | Tipo |
| :--- | :--- | :--- |
| **Dueño** | Es el dueño del lugar. Publica su propiedad, la edita, la da de baja y elige qué comodidades ofrece (Wi-Fi, pileta, etc.). | Usuario final |
| **Huésped** | Es el cliente. Busca propiedades, hace reservas y puede modificarlas o cancelarlas. También puede ver su historial de viajes. | Usuario final |
| **administrador** | Mantiene el sistema. Se encarga de agregar, modificar o quitar los servicios globales (ej: "Gimnasio") que se pueden seleccionar. | Usuario interno del sistema |
## 2. Requisitos Funcionales

| ID    | Descripción | Actor | HU relacionada |
|-------|-------------|-------|----------------|
| RF-01 |      El sistema debe permitir que el **huésped** se registre con correo electrónico y contraseña.        |     huesped  |      HU-01    |
| RF-02 |      El sistema debe permitir que el **dueño** publique un alojamiento con fotos, precio y descripción.     |    dueño  |    HU-02 | 
| RF-03 | El sistema debe permitir que el **huésped** busque alojamientos filtrando por ubicación, fechas y precio. | Huésped | HU-03 |
| RF-04 | El sistema debe permitir que el **huésped** realice una reserva seleccionando fechas disponibles. | Huésped | HU-04 |
| RF-05 | El sistema debe permitir que el **dueño** gestione sus reservas  | dueño | HU-05 |
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
| HU-01 | [rol/actor]   | [acción o funcionalidad]   | [beneficio o resultado esperado]   |
| HU-02 |               |                            |                                    |

## 5. Diagrama de Casos de Uso

> Insertar imagen del diagrama exportado desde Draw.io, Lucidchart, StarUML o similar.  
> Guardar la imagen en esta misma carpeta (`docs/`) y referenciarla abajo.

![Diagrama de Casos de Uso](./diagrama-casos-de-uso.png)

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
