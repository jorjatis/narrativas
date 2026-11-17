const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const styleChunksCacheGroups = require('./styleChunksCacheGroups.js');

const todasLasPaginas = fs.existsSync(path.resolve(__dirname, 'src/views/pages'))
  ? glob.sync('src/views/pages/**/*.hbs')
  : [];

module.exports = (env = {}, argv) => {
  const isProduction = argv.mode === 'production';
  // Producción (`npm run build`): solo index-ok y nada de desarrollo (localhost, Netlify, ?medio=, "Rellenar"...).
  // `npm run build:pruebas` (--env pruebas) y `npm start` lo incluyen todo.
  const desarrollo = !isProduction || Boolean(env.pruebas);
  const pages = desarrollo
    ? todasLasPaginas
    : todasLasPaginas.filter((p) => path.basename(p) === 'index-ok.hbs');

  return {
    mode: argv.mode || 'development',
    entry: './src/config.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'js/[name].js',
      chunkFilename: 'js/[name].js',
      clean: true,
      // 'auto': los JS que se cargan bajo demanda (html2canvas -> js/vendors.js) se buscan en la misma carpeta
      // desde la que se cargó main.js. Con '/' se buscaban en la raíz del dominio del medio y fallaban en el CMS.
      publicPath: 'auto',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@images': path.resolve(__dirname, 'src/assets/images'),
        '@styles': path.resolve(__dirname, 'src/assets/styles'),
        '@data': path.resolve(__dirname, 'src/data')
      }
    },
    devtool: isProduction ? false : 'eval-source-map',
    module: {
      rules: [
        {
          test: /\.hbs$/,
          loader: 'handlebars-loader',
          options: {
            partialDirs: [path.resolve(__dirname, 'src/views/partials')],
            helperDirs: [path.resolve(__dirname, 'src/views/helpers')]
          },
        },
        {
          test: /\.(c|sc|sa)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                sourceMap: !isProduction,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: !isProduction,
              },
            },
            {
              loader: 'resolve-url-loader',
              options: {
                sourceMap: !isProduction,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
      ],
    },
    optimization: {
      minimize: isProduction,
      // Sin runtime.js aparte: en el CMS basta con cargar main.js (y js/vendors.js en la misma carpeta).
      runtimeChunk: false,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          ...(styleChunksCacheGroups ? styleChunksCacheGroups() : {})
        },
      },
    },
    plugins: [
      new webpack.DefinePlugin({ ELEC_DESARROLLO: JSON.stringify(desarrollo) }),
      ...pages.map((filePath) => {
        const outputPath = path
          .relative('src/views/pages', filePath)
          .replace(/\.hbs$/, '.html');

        const pageName = path.basename(filePath, '.hbs');
        const dataFileJs = path.resolve(__dirname, `src/data/${pageName}.js`);
        const dataFileJson = path.resolve(__dirname, `src/data/${pageName}.json`);

        return new HtmlWebpackPlugin({
          template: filePath,
          filename: outputPath.replace(/\\/g, '/'), // Sin la "/" inicial para evitar errores en Windows/algunos servers
          inject: 'body',
          templateParameters: () => {
            if (fs.existsSync(dataFileJs)) {
              delete require.cache[require.resolve(dataFileJs)]; // Limpia cache para live reload
              return require(dataFileJs);
            }
            if (fs.existsSync(dataFileJson)) {
              return JSON.parse(fs.readFileSync(dataFileJson, 'utf8'));
            }
            return {};
          }
        });
      }),
      new MiniCssExtractPlugin({
        filename: 'assets/styles/[name].css',
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'public', to: '', noErrorOnMissing: true },
          { from: 'src/assets/images', to: 'assets/images', noErrorOnMissing: true },
          { from: 'src/assets/videos', to: 'assets/videos', noErrorOnMissing: true },
          { from: 'src/assets/audio', to: 'assets/audio', noErrorOnMissing: true },
          { from: 'src/favicon.ico', to: '', noErrorOnMissing: true },
          { from: 'src/js/vendors', to: 'js/vendors', noErrorOnMissing: true }
        ]
      })
    ],
    devServer: {
      static: [
        {
          directory: path.resolve(__dirname, 'dist'),
        },
        {
          directory: path.resolve(__dirname, 'public'),
          publicPath: '/',
        },
      ],
      port: 8080,
      open: true,
      hot: true,
      historyApiFallback: true,
      watchFiles: {
        paths: ['src/**/*'],
        options: {
          ignored: /node_modules/,
        },
      },
      client: {
        overlay: {
          errors: true,   // Muestra errores de compilación (Webpack)
          warnings: false,
          runtimeErrors: false, // <--- Esto desactiva el "BOOM" por errores de JS como el de Adobe
        },
      },
    },
    stats: {
      errorDetails: true,
    },
  };
};