const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    target: 'node', // in order to ignore built-in modules like path, fs, etc. 
    externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
  entry: {
    app: [
      'babel-polyfill',
      './src/index.js',
    ],
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'app.bundle.js',
  },
  module: {
    rules: [{
        test: /\.js?$/,
        exclude:path.resolve(__dirname, "node_modules"),
        loader: 'babel-loader',
        query: {
           presets: ['env', 'stage-0']
        }
    }]
  }
}