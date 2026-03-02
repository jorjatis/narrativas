const path = require('path');
const fs = require('fs');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const styleChunksCacheGroups = require('./styleChunksCacheGroups.js');

const pages = fs.existsSync(path.resolve(__dirname, 'src/views/pages'))
  ? glob.sync('src/views/pages/**/*.hbs')
  : [];

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: argv.mode || 'development',
    entry: './src/config.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      chunkFilename: isProduction ? '[name].[contenthash].js' : '[name].js',
      clean: true,
      publicPath: '/', 
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
            'css-loader',
            'postcss-loader',
            { loader: 'resolve-url-loader', options: { sourceMap: true } },
            { loader: 'sass-loader', options: { sourceMap: true } }
          ]
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
      ],
    },
    optimization: {
      splitChunks: {
        cacheGroups: styleChunksCacheGroups ? styleChunksCacheGroups() : {},
      },
    },
    plugins: [
      ...pages.map((filePath) => {
        const outputPath = path
          .relative('src/views/pages', filePath)
          .replace(/\.hbs$/, '.html');
        
        const pageName = path.basename(filePath, '.hbs');
        const dataFileJs = path.resolve(__dirname, `src/data/${pageName}.js`);
        const dataFileJson = path.resolve(__dirname, `src/data/${pageName}.json`);

        return new HtmlWebpackPlugin({
          template: filePath,
          filename: outputPath, // Sin la "/" inicial para evitar errores en Windows/algunos servers
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
        filename: 'assets/styles/[name].[contenthash].css',
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'src/assets/images', to: 'assets/images', noErrorOnMissing: true },
          { from: 'src/assets/videos', to: 'assets/videos', noErrorOnMissing: true },
          { from: 'src/favicon.ico', to: '', noErrorOnMissing: true }
        ]
      })
    ],
    devServer: {
      static: path.resolve(__dirname, 'dist'),
      port: 8080,
      open: true,
      hot: true,
      historyApiFallback: true,
      watchFiles: ['src/**/*.{hbs,js,json,scss}'],
      client: {
        overlay: {
          errors: true,   // Muestra errores de compilación (Webpack)
          warnings: false, 
          runtimeErrors: false, // <--- Esto desactiva el "BOOM" por errores de JS como el de Adobe
        },
      },
    },
  };
};