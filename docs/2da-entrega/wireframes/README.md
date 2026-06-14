# Entrega 2 — Diseño de Interfaces
**Grupo**: [Grupo N°1]
**Proyecto**: [Sistema de reservas de alojamiento]
**Fecha de entrega**: 25/06/2026
---
## 1. Inventario de pantallas troncales
| N° | Nombre | Actor principal | CU(s) cubierto(s) | Función (1 frase) |
|----|--------|------------------|---------------------|--------------------|
| 01 | Login |huesped/propietario | - HU- 01 | el usuario debe registrarse con usuario y contraseña
| 02 | Catalogo |huesped |-CU- 03| el usuario debe buscar un alojamiento por filtros adaptados a sus preferencias |
| 03 | | | | |
| 04 | | | | |
| 05 | | | | |
## 2. Trazabilidad pantalla ↔ E1
| Pantalla | CU(s) | HU(s) | Actor |
|----------|-------|-------|-------|
| 01 — Login |CU-01, CU-02|HU-01 |Huesped/propietario |
| 02 — Catalogo |CU-03 |HU-03 |Huesped |
| 03 — [Nombre] | | | |
| 04 — [Nombre] | | | |
| 05 — [Nombre] | | | |
---
## 3. Decisiones técnicas y observaciones
> Documentar acá las decisiones de diseño y desarrollo del grupo, organizadas por
pantalla.
> Esta sección es clave para la defensa oral del 25/06.
### Pantalla 01 — Login
- Se diseño una pantalla simple y sencilla, centrada en el login del proyecto.
- Permite al usuario, mediante el formulario de dos campos, ingresar con su usuario y contraseña.
- Incluimos un enlace para que el usuario pueda recuperar su cuenta en caso de perdida.
### Pantalla 02 — catalogo
- Para el catálogo elegimos colocar los filtros debajo del navbar y antes del listado, porque es lo más cómodo para el usuario: primero filtra según sus preferencias y luego ve los resultados adaptados a su búsqueda.
- Agregamos filtros de precio mínimo y máximo, buscador por palabra clave, paginacion visual y imagenes placeholder. 
- Cubre nuestro CU-03 'Buscar alojamiento'.
### Pantalla 03 — [Nombre]
- (Pendiente)
### Pantalla 04 — [Nombre]
- (Pendiente)
### Pantalla 05 — [Nombre]
- (Pendiente)
### Pantalla extra 06 - Recuperar email
- Realizamos una pantalla que nos permite recuperar el acceso a nuestra cuenta en caso de perdida de datos.
- Esta pantalla esta vinculada al login. 
- El usuario ingresa nuevamente el email, una vez ingresado le enviamos un codigo de recuperacion de cuenta. 
