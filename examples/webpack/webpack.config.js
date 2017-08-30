const { resolve } = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const url = require('url')
const { execSync } = require('child_process')

module.exports = (args = {}) => {
  const env = require('./config/' + (process.env.npm_config_config || args.config || 'default'))
  const version = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()

  return {
    entry: {
      manifest: './src/manifest',
      vendor: './src/vendor',
      index: './src/index'
    },

    output: {
      path: resolve(__dirname, 'dist'),
      filename: args.dev ? '[name].js' : '[name].[chunkhash].js',
      chunkFilename: '[id].[chunkhash].js',
      publicPath: env.publicPath
    },

    module: {
      rules: [
        {
          test: /\.vue$/,
          use: [
            {
              loader: 'vue-loader'
            },

            'eslint-loader'
          ]
        },

        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ['babel-loader', 'eslint-loader']
        },

        {
          test: /\.html$/,
          use: [
            {
              loader: 'html-loader',
              options: {
                root: resolve(__dirname, 'src'),
                attrs: ['img:src', 'link:href']
              }
            }
          ]
        },

        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader']
        },

        {
          test: /favicon\.png$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]?[hash]'
              }
            }
          ]
        },

        {
          test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
          exclude: /favicon\.png$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 10000
              }
            }
          ]
        }
      ]
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/index.html',
        chunksSortMode: 'manual',
        chunks: ['manifest', 'vendor', 'index']
      }),

      new webpack.HashedModuleIdsPlugin(),

      new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest']
      }),

      new webpack.DefinePlugin({
        DEBUG: Boolean(args.dev),
        CONFIG: JSON.stringify(Object.assign({ version }, env.runtimeConfig))
      }),

      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery'
      })
    ],

    resolve: {
      mainFiles: ['index', 'Index'],

      extensions: ['.js', '.json', '.vue'],

      alias: {
        src: resolve(__dirname, 'src')
      }
    },

    devServer: env.devServer ? {
      host: '0.0.0.0',
      disableHostCheck: true,
      port: env.devServer.port,
      proxy: env.devServer.proxy,
      historyApiFallback: {
        index: url.parse(env.publicPath).pathname,
        disableDotRule: true
      }
    } : undefined,

    performance: {
      hints: args.dev ? false : 'warning'
    },

    devtool: args.dev ? undefined : 'source-map'
  }
}
