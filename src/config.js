// Carga estilo principal
import './assets/styles/styles.scss';

// Cargar dinámicamente plantillas y datos desde las carpetas correspondientes
const templatesContext = require.context('./views/pages', true, /\.hbs$/);
const dataContext = require.context('./data', true, /\.json$/);

// Crear un objeto con las plantillas y los datos cargados automáticamente
const templates = Object.fromEntries(
  templatesContext.keys().map(file => {
    const name = file.replace('./', '').replace('.hbs', '');
    return [name, templatesContext(file)];
  })
);

const data = Object.fromEntries(
  dataContext.keys().map(file => {
    const name = file.replace('./', '').replace('.json', '');
    return [name, dataContext(file)];
  })
);

// Detectar la página actual basada en la URL
const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';

// Renderizar la plantilla correspondiente con sus datos
if (templates[currentPage]) {
  document.body.innerHTML = templates[currentPage](data[currentPage] || {});
} else {
  console.error(`No se encontró la plantilla para la página: ${currentPage}`);
}
