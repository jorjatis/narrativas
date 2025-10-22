const fs = require('fs');
const path = require('path');

/**
 * Genera cacheGroups para dividir estilos SCSS en chunks individuales.
 * Lee los archivos en la carpeta `src/assets/styles/chunks` y crea un grupo para cada uno.
 * 
 * @param {Object} options Opciones adicionales para configurar el comportamiento.
 * @param {string} options.directory Directorio base donde buscar los chunks SCSS.
 * @param {string[]} [options.extensions=['scss']] Extensiones de los archivos a incluir.
 * @returns {Object} cacheGroups configurado para Webpack
 */
function mapFilenamesToCacheGroups(options = {}) {
  const {
    directory = path.join(__dirname, 'src', 'assets', 'styles', 'chunks'),
    extensions = ['scss'],
  } = options;

  if (!fs.existsSync(directory)) {
    // Carpeta no existe → retornar vacío silenciosamente
    return {};
  }

  // Leer archivos en el directorio especificado
  const files = fs.readdirSync(directory)
    .filter(file => extensions.some(ext => file.endsWith(`.${ext}`)));

  // Generar cacheGroups basados en los archivos encontrados
  return files.reduce((cacheGroups, file) => {
    const name = path.basename(file, path.extname(file));
    const test = new RegExp(`${name}\\.${extensions.join('|')}$`);

    return {
      ...cacheGroups,
      [name]: {
        name,
        test,
        type: 'css/mini-extract',
        chunks: 'all',
        enforce: true,
      },
    };
  }, {});
}

module.exports = mapFilenamesToCacheGroups;
