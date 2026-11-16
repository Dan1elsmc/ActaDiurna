# Acta Diurna

Revista digital sobre la civilización romana y su sistema de numeración, con una zona de juegos (el Ludus).

## Estructura
- `index.html`: la página, con todas las secciones.
- `css/estilo.css`: estilos.
- `js/app.js`: juegos, pasaporte, dato del día y navegación.
- `img/`: fotografías (pendientes), con su crédito.

## Publicar en GitHub Pages
1. Crea un repositorio en GitHub y sube estos archivos tal cual, sin cambiar las carpetas.
2. En el repositorio entra a Settings, luego Pages.
3. En Source elige la rama `main` y la carpeta `/ (root)`, y guarda.
4. Espera uno o dos minutos: la revista quedará en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/`.

## Activar los comentarios del Foro (Giscus)
1. En el repositorio activa Discussions (Settings, Features).
2. Instala la app de Giscus en el repositorio y entra a https://giscus.app para generar tus datos.
3. Copia `repo`, `repoId`, `category` y `categoryId` en el objeto `GISCUS` al final de `js/app.js`.

## Antes de entregar
- Revisa fechas y cifras, y completa la bibliografía con las ediciones que uses.
- Añade fotografías en `img/` con su crédito y licencia.
