var webpack = require('webpack'),
	config = require('./webpack.config'),
	basePath = '';

// Better compression for production
config.devtool = 'cheap-module-source-map';

config.output.publicPath = '/';

// Use production version of React
config.plugins[0] =
	new webpack.DefinePlugin({
	  'process.env': {
			'NODE_ENV': JSON.stringify('production'),
			'appConfig': JSON.stringify('development'),
			'basePath': JSON.stringify(basePath)
	  }
	});

module.exports = config;