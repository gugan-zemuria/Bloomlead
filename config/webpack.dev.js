const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { getWebpackProxyConfig, setupMiddleware } = require('./proxy.config');

module.exports = {
  mode: 'development',
  entry: './src/app.js',
  
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: '[name].js',
    clean: true,
    publicPath: '/'
  },
  
  devServer: {
    static: {
      directory: path.join(__dirname, '../'),
      publicPath: '/'
    },
    compress: true,
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: {
      // Handle SPA routing - serve index.html for all routes except assets and API
      rewrites: [
        { from: /^\/api\/.*$/, to: function(context) {
          return context.parsedUrl.pathname;
        }},
        { from: /^\/auth\/.*$/, to: function(context) {
          return context.parsedUrl.pathname;
        }},
        { from: /^\/uploads\/.*$/, to: function(context) {
          return context.parsedUrl.pathname;
        }},
        { from: /.*/, to: '/index.html' }
      ]
    },
    
    // Use proxy configuration from separate file
    proxy: getWebpackProxyConfig(),
    
    // Additional headers for CORS and security
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization, X-CSRF-Token',
      'Access-Control-Allow-Credentials': 'true'
    },
    
    // Handle client-side routing and errors
    client: {
      overlay: {
        errors: true,
        warnings: false
      },
      logging: 'info'
    },
    
    // Custom middleware setup
    setupMiddlewares: setupMiddleware
  },
  
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|webp)$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]'
        }
      }
    ]
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
      inject: 'body'
    })
  ],
  
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@components': path.resolve(__dirname, '../src/components'),
      '@services': path.resolve(__dirname, '../src/core/services'),
      '@utils': path.resolve(__dirname, '../src/core/utils'),
      '@config': path.resolve(__dirname, '../src/core/config')
    }
  },
  
  devtool: 'eval-source-map'
};