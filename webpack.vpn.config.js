var webpack = require('webpack'),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
	CopyWebpackPlugin = require('copy-webpack-plugin'),
	config = require('./webpack.config');

config.output.publicPath = '/';

// Use custom dev environment property to load the right config file
// vpn & prod configs are the same for now, but they will be changing once the prod URLs are defined
config.plugins[0] =
	new webpack.DefinePlugin({

		'process.env': {
			'NODE_ENV': JSON.stringify('vpn'),
			'appConfig': JSON.stringify('vpn'),
			'basePath': JSON.stringify('')
		}
	});
// overwrite config file copy
config.plugins[3] =
	new CopyWebpackPlugin([
		{
			from: 'app.vpn.config.json',
			to: 'config/app.vpn.config.json',
			transform: (content, path) => 'window.__APP_CONFIG__ = ' + content
		}
	]);
// use custom CORS headers for server origin to allow accessing cookies
config.devServer.headers = {
      "Origin": "http://env07.calheers.local/"
};

module.exports = config;