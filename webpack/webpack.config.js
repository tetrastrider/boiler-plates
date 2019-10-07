const path = require('path');
const webpack = require('webpack'); //to access built-in plugins
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MinifyPlugin = require("babel-minify-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const NpmInstallPlugin = require('npm-install-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
module.exports = {
	entry:["@babel/polyfill",'./src/index.ts'],
	resolve:{extensions: ['.webpack.js', '.web.js', '.ts', '.js']},
	output: {
    filename: 'main.js',
    //libraryTarget: 'this',
    path: path.resolve(__dirname, 'dist'),
  },
  //target: 'node',
 // externals: [nodeExternals()],
	module:{
		rules:[
			{ test:/\.js.$/, exclude:/node_modules/, use:{ loader:"babel-loader" } },
			{ test: /\.html$/, use:[ { loader:"html-loader", options:{ minimize:true} } ] },
			{ test:/\.(png|svg|jpg|gif)$/, use:['file-loader'] },
			{ test: /\.(woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' },
			{test:/\.scss$/,use:["style-loader",MiniCssExtractPlugin.loader,"css-loader","postcss-loader","sass-loader"]},
			{ test: /\.txt$/, use: 'raw-loader' },
			{ test: /.ts$/, loader: 'ts-loader' }
		]
	},
	plugins:[ 
	new HtmlWebPackPlugin({ template:"./src/index.html", filename:"./index.html" }),
	new MinifyPlugin({mangle: { topLevel: true }},require("babel-preset-minify")),
	new MiniCssExtractPlugin({ filename:"[name].css",chunkFilename:"[id].css" })//,
	//new CleanWebpackPlugin()
	 ]
}


