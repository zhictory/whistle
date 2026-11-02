var webpack = require('webpack');
var path = require('path');
var PROJECT_ROOT = path.join(__dirname, '../../../..');

module.exports = {
  entry: {
    index: path.join(__dirname, './js/index'),
    decode: path.join(__dirname, './js/decode')
  },
  output: {
    path: path.join(__dirname, '../js'),
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: [
          path.join(__dirname, 'js'),
          path.join(PROJECT_ROOT, 'node_modules/bootstrap/js/dist')
        ],
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=1000000'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]
};
