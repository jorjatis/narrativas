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
