# Entrega 2 — Diseño de Interfaces

* **Grupo:** Grupo N°1
* **Proyecto:** Sistema de reservas de alojamiento
* **Fecha de entrega:** 25/06/2026

---

## 1. Inventario de pantallas troncales

| N° | Nombre | Actor principal | CU(s) / HU(s) cubierto(s) | Función (1 frase) |
|:---:|:---|:---|:---|:---|
| **01** | Login | Huésped / Propietario | HU-01 | Permite ingresar al sistema mediante usuario y contraseña. |
| **02** | Catálogo | Huésped | CU-03 Buscar alojamiento | Permite buscar alojamientos aplicando filtros según las preferencias del usuario. |
| **03** | Detalle + Realizar reserva | Huésped | CU-01 Realizar reserva<br>CU-05 Consultar disponibilidad | Permite consultar la disponibilidad de un alojamiento y realizar una reserva. |
| **04** | Mis reservas | Huésped | CU-06 Cancelar reserva<br>CU-12 Modificar reserva | Permite visualizar, modificar o cancelar reservas realizadas. |
| **05** | Publicar alojamiento | Propietario | CU-02 Publicar alojamiento | Permite registrar y publicar un alojamiento en la plataforma. |

---

## 2. Trazabilidad pantalla ↔ E1

| Pantalla | CU(s) Cubiertos | HU(s) | Actor |
|:---|:---|:---:|:---|
| **01 — Login** | *(Ninguno específico / Implícito)* | HU-01 | Huésped / Propietario |
| **02 — Catálogo** | CU-03 Buscar alojamiento | HU-03 | Huésped |
| **03 — Detalle + Realizar reserva** | CU-01 Realizar reserva<br>CU-05 Consultar disponibilidad | HU-04 | Huésped |
| **04 — Mis reservas** | CU-06 Cancelar reserva<br>CU-12 Modificar reserva | HU-05 | Huésped |
| **05 — Publicar alojamiento** | CU-02 Publicar alojamiento | HU-02 | Propietario |

---

## 3. Decisiones técnicas y observaciones

### Pantalla 01 — Login
* Se diseñó una pantalla simple y centrada en el acceso al sistema.
* Permite al usuario ingresar mediante usuario y contraseña.
* Incluimos un enlace para recuperar la cuenta en caso de pérdida de acceso.

### Pantalla 02 — Catálogo
* Para el catálogo elegimos colocar los filtros debajo del *navbar* y antes del listado, porque el usuario primero define sus preferencias y luego visualiza los resultados.
* Agregamos filtros de precio mínimo y máximo, buscador por palabra clave, paginación visual e imágenes de ejemplo.
* Decidimos no incorporar filtros más avanzados para mantener una interfaz simple.
* Cubre nuestro **CU-03 "Buscar alojamiento"**.

### Pantalla 03 — Detalle + Realizar reserva
* Utilizamos Flexbox para mostrar la información principal del alojamiento junto al formulario de reserva, permitiendo visualizar ambos elementos al mismo tiempo.
* Agregamos información del anfitrión para brindar más contexto al huésped.
* Decidimos no incluir sugerencias de fechas alternativas ni políticas de cancelación para mantener la pantalla enfocada en la reserva.
* Cubre los **CU-01 "Realizar reserva"** y **CU-05 "Consultar disponibilidad"**.
* El botón final representa la confirmación inmediata de la reserva, ya que en nuestro modelo las reservas se confirman en el momento y bloquean las fechas seleccionadas.

### Pantalla 04 — Mis reservas
* Elegimos un listado de reservas en formato de tarjetas para facilitar la lectura de la información.
* Mostramos reservas con estado "Confirmada" y "Cancelada", diferenciadas visualmente mediante *badges*.
* La reserva mostrada coincide con la realizada en la pantalla 03 para mantener la coherencia narrativa del sistema.
* Cubre los **CU-06 "Cancelar reserva"** y **CU-12 "Modificar reserva"**.
* No agregamos filtros por estado ni separación entre reservas futuras y pasadas para mantener una interfaz sencilla.
* *Nota:* Consultamos IA para resolver dudas puntuales sobre la estructura de los *badges* y la alineación de botones mediante Flexbox.

### Pantalla 05 — Publicar alojamiento
* Esta pantalla es utilizada por el Propietario, un actor distinto al de las pantallas 1 a 4.
* Organizamos los campos del formulario utilizando agrupaciones lógicas para mejorar la carga de información.
* La propiedad publicada corresponde a la misma utilizada en el catálogo y en el detalle de alojamiento, manteniendo la coherencia entre pantallas.
* Cubre el **CU-02 "Publicar alojamiento"**.
* No implementamos previsualización de imágenes ni guardado avanzado de borradores porque son funcionalidades opcionales.
* *Nota:* Consultamos IA para resolver dudas puntuales sobre la organización de formularios y validaciones nativas de HTML.

### Pantalla extra 06 — Recuperar email
* Realizamos una pantalla que permite recuperar el acceso a una cuenta.
* Está vinculada directamente con la pantalla de Login.
* El usuario ingresa su correo electrónico y el sistema envía un código de recuperación de una manera simulada.

---
