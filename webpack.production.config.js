var webpack = require('webpack'),
	config = require('./webpack.config'),
	basePath = '/static/lw-web',
	CopyWebpackPlugin = require('copy-webpack-plugin'),
	WebpackMd5Hash = require('webpack-md5-hash');
	

// Better compression for production
config.devtool = 'cheap-module-source-map';

config.output.publicPath = basePath;
config.output.filename = '[name].[chunkhash].js';
config.output.chunkFilename = '[name].[chunkhash].js';

// Use production version of React
config.plugins[0] =
	new webpack.DefinePlugin({
		'process.env': {
			'NODE_ENV': JSON.stringify('production'),
			'appConfig': JSON.stringify('production'),
			'basePath': JSON.stringify(basePath)
		}
	});
// overwrite config file copy
// note: this is only here to support production builds outside main build environment.
// when a build is deployed to a server, the app.production.config.json file produced here will be overwritten.
config.plugins[3] =
	new CopyWebpackPlugin([
		{
			from: 'app.production.config.json',
			to: 'config/app.production.config.json',
			transform: (content, path) => 'window.__APP_CONFIG__ = ' + content
		},
		{ from: 'src/coveredca_gtm_head.js', to: 'coveredca_gtm_head.js' },
		{ from: 'src/coveredca_eloqua_head.js', to: 'coveredca_eloqua_head.js' }
	]);

// add webpack-md5-hash to lock vendor build hash
config.plugins.push(new WebpackMd5Hash());

// override image path for production builds
config.module.loaders[3] = {
	test: /\.(png|jpg|gif)$/,
	// export any images larger than 1kb as files rather than bundling as data urls
	loader: 'url-loader?limit=1024&name=/images/[name].[ext]'
};

module.exports = config;
