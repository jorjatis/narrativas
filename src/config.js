// Carga estilo principal
import './assets/styles/styles.scss';

// // Cargar js principal
import './js/main.js';

// /**
//  * Lógica de Renderizado Dinámico
//  * Solo se ejecuta en Modo Desarrollo (npm start / webpack serve)
//  */
// if (process.env.NODE_ENV !== 'production') {
//   try {
//     const templatesContext = require.context('./views/pages', true, /\.hbs$/);
//     const dataContext = require.context('./data', true, /\.json$/);

//     const templates = Object.fromEntries(
//       templatesContext.keys().map(file => {
//         // Limpiamos la ruta para que coincida con el nombre de la página
//         const name = file.replace('./', '').replace('.hbs', '');
//         return [name, templatesContext(file)];
//       })
//     );

//     const data = Object.fromEntries(
//       dataContext.keys().map(file => {
//         const name = file.replace('./', '').replace('.json', '');
//         return [name, dataContext(file)];
//       })
//     );

//     // Detectar página actual
//     const path = window.location.pathname;
//     let currentPage = path.split('/').pop().replace('.html', '') || 'index';
    
//     // Si estás en una subcarpeta (ej: /pages/contacto), ajustamos el nombre
//     if (path.includes('/views/pages/')) {
//        currentPage = path.split('/views/pages/').pop().replace('.html', '');
//     }

//     // Solo renderizamos si el body está vacío (evita pisar el trabajo de HtmlWebpackPlugin)
//     if (templates[currentPage]) {
//       console.log(`%c Renderizando plantilla: ${currentPage}`, "color: green; font-weight: bold");
//       document.body.innerHTML = templates[currentPage](data[currentPage] || {});
//     } else {
//       console.warn(`No se encontró la plantilla local para: ${currentPage}. Es posible que estés viendo el HTML estático de Webpack.`);
//     }
//   } catch (e) {
//     console.error("Error en el cargador de plantillas de desarrollo:", e);
//   }
// }