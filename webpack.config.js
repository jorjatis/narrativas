const path = require('path');
const fs = require('fs');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin  = require('copy-webpack-plugin');
const styleChunksCacheGroups = require('./styleChunksCacheGroups.js');

// Obtener páginas solo si existe la carpeta
const pages = fs.existsSync(path.resolve(__dirname, 'src/views/pages'))
  ? glob.sync('src/views/pages/**/*.hbs')
  : [];

module.exports = {
  // devtool: 'source-map', // Desactivar en produccion o si la build es lenta
  entry: './src/config.js', // Punto de entrada de tu aplicación
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[name].js',
    clean: true, // Limpia el directorio 'dist' antes de generar los archivos
    publicPath: '/', // Se utiliza para los enlaces públicos de los archivos generados
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@images': path.resolve(__dirname, 'src/assets/images'),
      '@videos': path.resolve(__dirname, 'src/assets/videos'),
      '@styles': path.resolve(__dirname, 'src/assets/styles'),
      '@fonts': path.resolve(__dirname, 'src/assets/fonts'),
      '@data': path.resolve(__dirname, 'src/data')
    }
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
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          {
            loader: 'resolve-url-loader',
            options: { sourceMap: true } // ✅ aquí
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true, // ✅ importante para resolve-url-loader
              sassOptions: { sourceMapIncludeSources: true }
            }
          }
        ]
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
    // ✅ Solo intentar generar HTML de las páginas existentes
    ...pages.map((filePath) => {
      const outputPath = path
        .relative('src/views/pages', filePath)
        .replace(/\.hbs$/, '.html');
      const pageName = path.basename(filePath, '.hbs');
      const dataFileJs = path.resolve(__dirname, `src/data/${pageName}.js`);
      const dataFileJson = path.resolve(__dirname, `src/data/${pageName}.json`);

      return new HtmlWebpackPlugin({
        template: filePath,
        filename: `/${outputPath}`,
        templateParameters: () => {
          // ✅ Soporta JSON o JS
          if (fs.existsSync(dataFileJs)) return require(dataFileJs);
          if (fs.existsSync(dataFileJson)) return require(dataFileJson);
          console.warn(`⚠️ No hay datos para la página ${pageName}`);
          return {};
        }
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
          to: path.join('assets', 'images'),
          noErrorOnMissing: true
        },
        {
          from: path.join('src', 'assets', 'videos'),
          to: path.join('assets', 'videos'),
          noErrorOnMissing: true
        },
        {
          from: path.join('src', 'data'),
          to: path.join('data'),
          globOptions: {
            ignore: ['**/*.json']
          },
          noErrorOnMissing: true
        },
        {
          from: path.join('src', 'favicon.ico'),
          to: '',
          noErrorOnMissing: true
        }
      ]
    })
  ],
  devServer: {
    static: path.resolve(__dirname, 'dist'), // Directorio desde donde servir los archivos
    port: 8080, // Puerto del servidor
    open: true, // Abre el navegador automáticamente
    hot: true, // Habilita el hot-reloading
    watchFiles: ['src/**/*.{hbs,js,json,scss}'], // Live reload inteligente
    historyApiFallback: true, // Permite redirigir a HTML5 History API
  },
};
