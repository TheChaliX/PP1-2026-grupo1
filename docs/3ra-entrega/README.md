# Reporte Técnico: 3ra Entrega - Lógica e Interactividad con JavaScript

**Materia:** Práctica Profesionalizante I  
**Proyecto:** Sistema de Reservas de Alojamiento  
**Año:** 2026  

---

## 1. Tabla de Capacidades JS y Trazabilidad de Casos de Uso (CU)

A continuación se detalla cómo se relacionan los Casos de Uso definidos en la Entrega 1 con la implementación técnica en JavaScript solicitada para la Entrega 3:

| Capacidad Requerida | Caso de Uso (CU) Relacionado | Implementación Técnica en Código |
| :--- | :--- | :--- |
| **1. Login y Registro Validados** | CU01 - Iniciar Sesión / Registro | Captura del evento `submit` con `preventDefault()`. Validaciones de campos vacíos, longitud de contraseña y formato de email mediante Expresión Regular (`regex`). Los errores se despliegan en el DOM (`#mensajeError`) sin utilizar `alert()`. |
| **2. Listado Dinámico (`fetch`)** | CU02 - Consultar Catálogo / Mis Reservas | Consumo asíncrono de `data/reservas.json` usando `async/await`. Renderizado dinámico de tarjetas/filas en el DOM mediante manipulación de `innerHTML` e interpolación de plantillas (`template literals`). |
| **3. Acción del Usuario sobre los Datos** | CU03 - Publicar / Cancelar Reserva | Manejo de eventos sobre colecciones en memoria. Implementación de una función `async` independiente (`guardarAlojamiento`) para agregar nuevos registros persistidos en `localStorage` y actualización del estado de reserva sin recargar la página. |
| **4. Manejo de los 3 Estados de Interfaz** | CU02 - Consultar Catálogo | Control explícito de la UI contemplando los 3 estados: **Cargando** (mensaje previo mientras se resuelve la promesa), **Vacío** (mensaje personalizado cuando un filtro no arroja resultados) y **Error** (captura de excepciones con `try...catch` y mensaje descriptivo en el DOM). |

---

## 2. Decisiones Técnicas del Grupo

* **Arquitectura de Scripts Modular:** Se separó la lógica en archivos JavaScript independientes por cada vista dentro de `frontend/js/` (`login.js`, `catalogo.js`, `reservas.js`, `publicar-alojamiento.js`, `detalle.js`, `registro.js`) para garantizar la mantenibilidad y desacoplar responsabilidades.
* **Persistencia Local con `localStorage`:** Para simular la persistencia de datos exigida en la publicación de nuevos alojamientos sin depender de un servidor backend, combinamos los datos provenientes de `data/reservas.json` con las publicaciones almacenadas dinámicamente en el `localStorage` del navegador.
* **Procesamiento de Imágenes con `FileReader`:** En el formulario de publicación se implementó la API de `FileReader` para convertir los archivos seleccionados por el usuario en cadenas Base64. De este modo, las imágenes subidas localmente pueden visualizarse directamente en el catálogo y en la vista de detalle.
* **Uso de HTML Semántico y Flexbox/Bootstrap:** Se mantuvieron los principios de HTML semántico definidos en entregas previas y la estructuración responsiva mediante CSS Flexbox y Bootstrap para los componentes de tarjetas y controles de formulario.

---

## 3. Declaración del Uso de Inteligencia Artificial (IA)

En cumplimiento con las pautas de evaluación y ética académica de la institución, declaramos el uso de herramientas de **IA Generativa** (Gemini / ChatGPT) bajo los siguientes términos:

1. **Campos de Aplicación:**
   * Apoyo en la optimización de sintaxis asíncrona (`async/await`) y manejo de promesas con `fetch`.
   * Estructuración del lector de archivos en Base64 mediante `FileReader`.
   * Revisión y auditoría de la lista de chequeo frente a los requisitos obligatorios de la consigna.
2. **Supervisión y Validación Humana:** Todo el código y la documentación sugeridos por la herramienta de IA fueron revisados, probados localmente mediante la extensión **Live Server** en VS Code, adaptados a la semántica particular de nuestro proyecto y validados por los integrantes del equipo.