const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin  = require('copy-webpack-plugin');
const styleChunksCacheGroups = require('./styleChunksCacheGroups.js');

module.exports = {
  devtool: 'source-map', // Desactivar en produccion o si la build es lenta
  entry: './src/config.js', // Punto de entrada de tu aplicación
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[name].js',
    clean: true, // Limpia el directorio 'dist' antes de generar los archivos
    publicPath: '/', // Se utiliza para los enlaces públicos de los archivos generados
  },
  module: {
    rules: [
      // Manejo de archivos .hbs
      {
        test: /\.hbs$/,
        loader: 'handlebars-loader',
        options: {
          partialDirs: [path.resolve(__dirname, 'src/views/partials')], // Directorios donde se encuentran los partials
        },
      },
      // Manejo de archivos .scss y .css
      {
        test: /\.(c|sc|sa)ss$/,
        use: [
          MiniCssExtractPlugin.loader, // Extrae el CSS a un archivo separado
          'css-loader', // Resuelve @import y URL
          'postcss-loader',
          'resolve-url-loader', // Para manejar los URLs relativos dentro del CSS
          {
            loader: 'sass-loader',
            options: { sassOptions: { sourceMapIncludeSources: true } }, // Manejo de SCSS
          },
        ],
      },
      // Manejo de imágenes (JPG, PNG, GIF, SVG)
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      // Manejo de tipografías (WOFF, TTF, OTF, EOT)
      {
        test: /\.(woff2?|ttf|eot|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext][query]', // Establece la ruta final de las tipografías
        },
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: styleChunksCacheGroups(),
    },
  },
  plugins: [
    // Generar HTML para todas las páginas de src/views/pages
    ...glob.sync('src/views/pages/**/*.hbs').map((filePath) => {
      const outputPath = path.relative('src/views/pages', filePath).replace(/\.hbs$/, '.html'); // Define la ruta de salida del HTML
      const pageName = path.basename(filePath, '.hbs');
      const dataPath = path.resolve(__dirname, `src/data/${pageName}.js`); // Ruta de los archivos JSON asociados

      return new HtmlWebpackPlugin({
        template: filePath, // Plantilla .hbs
        filename: `/${outputPath}`, // Nombre del archivo HTML de salida
        templateParameters: () => {
          try {
            return require(dataPath); // Carga los datos asociados a la plantilla
          } catch (e) {
            console.warn(`No se encontró archivo de datos para ${pageName}`);
            return {}; // Retorna un objeto vacío si no hay datos
          }
        },
      });
    }),
    // Extraer el CSS en un archivo separado
    new MiniCssExtractPlugin({
      filename: 'assets/styles/[name].css', // Archivo CSS final
      chunkFilename: 'assets/styles/[name].css', // Archivo CSS final
    }),
    // Meter imagenes en dist
    new CopyWebpackPlugin({
      patterns: [
        { 
          from: path.join('src', 'assets', 'images'),
          to: path.join('assets', 'images')
        },
        {
          from: path.join('src', 'assets', 'videos'),
          to: path.join('assets', 'videos')
        },
        {
          from: path.join('src', 'assets', 'data'),
          to: path.join('assets', 'data')
        }
      ]
    }),
  ],
  devServer: {
    static: path.resolve(__dirname, 'dist'), // Directorio desde donde servir los archivos
    port: 8080, // Puerto del servidor
    open: true, // Abre el navegador automáticamente
    hot: true, // Habilita el hot-reloading
    watchFiles: ['src/**/*'], // Observa los archivos en la carpeta 'src'
    historyApiFallback: true, // Permite redirigir a HTML5 History API
  },
};
