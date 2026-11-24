# Frontend Web Architecture (HTML, Handlebars, SCSS, JavaScript)

Este proyecto es una **arquitectura base** para la creación de sitios web estáticos utilizando tecnologías modernas como **HTML**, **Handlebars (HBS)**, **SCSS**, y **JavaScript**. Proporciona una estructura organizada para desarrollar rápidamente sitios web en desarrollo/local, con una configuración optimizada de Webpack para el manejo de plantillas, estilos y recursos.

## Características

- **Handlebars** para plantillas HTML dinámicas.
- **SCSS** para estilos flexibles y organizados.
- Configuración de **Webpack** para manejo de:
  - Compilación de SCSS a CSS.
  - Manejo de imágenes, tipografías y otros activos.
  - División de código (chunking) para optimización de recursos.
- **Auto-carga de datos** desde archivos JSON para llenar las plantillas Handlebars.
- **Servidor de desarrollo** con soporte de hot-reloading para facilitar el trabajo durante el desarrollo.

## Estructura del Proyecto

El proyecto tiene la siguiente estructura de carpetas y archivos:

```bash
.
└── src/ 
    ├── assets/ 
    │   ├── images/ # Imágenes estáticas 
    │   ├── fonts/ # Fuentes 
    │   └── styles/ 
    │       ├── chunks/ # Archivos SCSS adicionales para fragmentos /
    │           ├── personalization-x.scss
    │       │   └── [...].scss
    │       └── main.scss # Estilos principales 
    ├── data/ # Archivos JSON con datos para las plantillas /
    │   ├── index.json
    │   ├── about.json
    │   └── [...].json
    ├── js/ # Archivos JS /
    │   ├── main.json
    ├── views/ 
    │   ├── pages/ # Plantillas Handlebars (HBS) para las páginas 
    │       ├── index.hbs
    │       ├── about.hbs
    │       └── [...].hbs
    │   └── partials/ # Parciales para las plantillas Handlebars (HBS)
    │       ├── header.hbs
    │       ├── footer.hbs
    │       └── [...].hbs
    ├── config.js # Punto de entrada de la aplicación 
    ├── webpack.config.js # Configuración de Webpack 
    └── package.json # Dependencias y scripts
```

## Requisitos

- **Node.js** v14 o superior.
- **npm** o **yarn** (se recomienda npm).

## Instalación

1. Clona este repositorio en tu máquina local:

   ```bash
   git clone https://github.com/tu-usuario/tu-repositorio.git
   cd tu-repositorio
   ```

2. Instala las dependencias necesarias:
  ```bash
  npm install
  ```

3. Ejecuta el servidor de desarrollo:
  ```bash
  npm run dev
  ```

4. Abre tu navegador en http://localhost:8080 para ver el proyecto en ejecución.

## Scripts Disponibles

En el proyecto se incluyen los siguientes scripts:

- npm run dev: Ejecuta el servidor de desarrollo con hot-reloading.
- npm run build: Construye el proyecto para producción, optimizando todos los recursos y generando los archivos finales en la carpeta dist/.
- npm run clean: Elimina la carpeta dist/ para limpiar el entorno de trabajo.

## Personalización

### SCSS

Puedes agregar o modificar estilos SCSS en la carpeta src/assets/styles/. El archivo main.scss es el punto de entrada principal, mientras que los fragmentos adicionales de SCSS pueden colocarse en la carpeta chunks/.

### Plantillas Handlebars

Las plantillas se encuentran en src/views/pages/. Puedes agregar nuevas plantillas .hbs y, si lo deseas, asociarlas a datos específicos en la carpeta data/ creando archivos JSON que contengan los datos dinámicos para esas plantillas.

### Archivos de Datos

Cada página puede tener un archivo JSON en src/data/ que contiene los datos necesarios para rellenar la plantilla correspondiente. Si la página es index.hbs, por ejemplo, debes crear un archivo index.json con los datos que quieres utilizar en esa plantilla.

## Webpack

La configuración de Webpack está lista para trabajar con:

- Compilación de SCSS en archivos CSS optimizados.
- Manejo de imágenes (como JPG, PNG, GIF, SVG) usando Webpack.
- Caché de archivos con nombres únicos basados en hash (para optimización de caché).
- Fragmentación de código para que los archivos CSS y JavaScript se carguen solo cuando se necesiten.

## Contribuciones

Si deseas contribuir a este proyecto:

1. Realiza un fork del repositorio.
2. Crea una rama para tu característica o corrección: git checkout -b feature/nueva-caracteristica.
3. Realiza tus cambios y haz un commit: git commit -m 'Agrega nueva característica'.
4. Sube tus cambios: git push origin feature/nueva-caracteristica.
5. Abre un pull request en GitHub.

## Licencia

Este proyecto está bajo la Licencia MIT. Puedes ver más detalles en el archivo LICENSE.

## Test electoral 29N

### Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Preguntas, respuestas de los partidos y pesos | `src/data/elecciones/preguntas_29N.json` |
| Coordenadas de los partidos | `src/data/elecciones/partidos_29N.json` |
| Nombre en pantalla y clase de color de cada partido | `src/data/elecciones/partidos-visual.json` |
| Datos para las plantillas (genera las 24 preguntas, las barras y los desplegables) | `src/data/lib/elecciones.js` (lo usan `index.js` e `index-sandbox.js`) |
| Lógica: cálculo, localStorage, API, medio, compartir | `src/js/elecciones/` |
| Conexión de la lógica con la visual | `src/js/modules/electionsApp.js` |

Para cambiar preguntas o partidos basta con sustituir los JSON: las plantillas y el cálculo salen de ellos.
Si los dos JSON no cuadran entre sí, `npm test` lo dice.

El texto de **Necesito saber más** de cada pregunta es el campo `contexto` de `preguntas_29N.json`
(`"p1": { "claim": "...", "contexto": "...", ... }`). Mientras falte, la pregunta enseña un aviso de
"Contexto pendiente" y `npm test` lo recuerda con un TODO.

La matriz se pinta de -2,2 a 2,2 para que los partidos extremos no queden pegados al borde
(`MARGEN_PLANO` en `src/js/elecciones/config.js`); no afecta al cálculo ni a lo que se envía.

### API

Siempre se llama a preproducción (`API_BASE` en `src/js/elecciones/config.js`). En `localhost` y en
`*.netlify.app` el medio se elige con `?medio=` (por defecto `elcorreo`); en un medio real sale de su dominio.

### Dos versiones

| Página | Para qué |
|---|---|
| `index-sandbox.html` | **Pruebas**: botón *Rellenar test* y avisos de lo que falta (contexto de las preguntas, metodología). |
| `index.html` | **Limpia**, la que se publica: nada de pruebas. Sin contexto en una pregunta no sale *Necesito saber más*; sin metodología no sale ese bloque. La metodología va en `src/data/index.json`, campo `metodologia` (admite HTML). |

Las dos usan las mismas plantillas; la diferencia está en `src/data/index-sandbox.js` / `index.js`.

### Para el CMS

`npm run build` genera además **`dist/cms/v-elec.html`**: el bloque `<div class="v-elec">…</div>` de
`index.html`, que es lo que se pega en el CMS (lo hace `scripts/extraer-cms.js` y avisa si falta algo).

- Es autocontenido: los iconos que usa (`<symbol>`) van dentro del propio bloque.
- Ya lleva el `<link>` de `assets/styles/main.css` y el `<script>` de `js/main.js`, con `?v=` calculado del
  contenido (cada subida rompe la caché sola). Solo hay que cambiar `RUTA_DIST` por la URL de la carpeta del FTP,
  o lanzar el build con ella: `CMS_RUTA=https://servidor/carpeta npm run build`.
- Subid la carpeta `dist` manteniendo su estructura: `js/vendors.js` (html2canvas, solo se descarga al
  compartir) se busca junto a `js/main.js`.
- Lleva al principio un `<script>` de arranque (`elections-boot.hbs`) que elige la vista inicial (portada,
  "Continuar" o resultados) antes de pintar, según lo guardado en el navegador.
- El footer y los `.v-c-cmp` de créditos y metodología del CMS quedan ocultos hasta que hay resultados
  (`body:has(.v-elec.is-widgets-on)` en `_elections-global.scss`).
- Del medio se usan: `<title>`, `og:site_name` (nombre del medio en el texto de compartir), `link[rel=canonical]`
  (enlace del texto), `apple-touch-icon` (logo del modal) y el JS de Vocento (desplegables y modal).

### Carrusel

Las tarjetas a las que aún no se puede ir (`.v-elec-test__item--locked`) no tienen punto de snap y son
`inert`. Si el lector está en la última tarjeta permitida, el gesto hacia delante (dedo, trackpad o rueda)
se cancela al empezar, así que el carrusel ni se mueve; hacia atrás y el scroll vertical funcionan normal.

### Probar

```bash
npm test     # tests (Node 20.10 o superior)
npm start    # página en http://localhost:8080  ->  ?medio=ideal para otro medio
```

En `index-sandbox.html` está el botón **Rellenar test**: contesta las 24 preguntas al azar por el mismo
camino que un lector y deja el test en la pregunta de partido. Al elegir partido se termina y se envía a
preproducción como un voto más (cuenta para los 10 intentos y para el límite de 150 por IP).
