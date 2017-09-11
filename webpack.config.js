var path = require('path'),
	webpack = require('webpack'),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
	CopyWebpackPlugin = require('copy-webpack-plugin'),
	ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
	// devtool: 'cheap-module-source-map',

	entry: {
		/* main entry point for app */
		main: './src/index.jsx'
		},

	output: {
		path: path.join(__dirname, 'build'),
		filename: '[name].js',
		publicPath: '/'
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('development'),
				'appConfig': JSON.stringify('development'),
				'basePath': JSON.stringify('')
			}
		}),
		new CopyWebpackPlugin([
			{ from: 'src/sample-data/', to: 'data/' },
			{ from: 'src/polyfills.js', to: 'polyfills.[hash].js' }
		]),
		new HtmlWebpackPlugin({
			title: 'CalHEERs UI',
			template: './src/index.html',
			chunksSortMode: 'dependency'
		}),
		new CopyWebpackPlugin([
			{
				from:      'app.development.config.json',
				to:        'config/app.development.config.json',
				transform: (content, path) => 'window.__APP_CONFIG__ = ' + content
			}
		]),
		// [contenthash] forces the filename to be the hash of the file's contents,
		// guaranteeing a new, cache-busting filename on every build that contains css changes
		new ExtractTextPlugin('css/[contenthash].css', { allChunks: true }),
		/* extract vendor files into chunk */
		/* extract webpack runtime */
		new webpack.optimize.CommonsChunkPlugin({
			name: 'vendor',
			minChunks: module => module.context && module.context.indexOf('node_modules') !== -1
		}),
		// lock dependency loading order
		new webpack.optimize.OccurenceOrderPlugin()
	],

  module: {
    preLoaders: [{
      test:    /\.jsx?$/,
      exclude: [/node_modules/, /build/],
      loader: 'jscs-loader'
    }],
    loaders: [
      {
        test: /\.jsx?$/,
        include: path.join(__dirname, 'src'),
        loader: 'babel',
        query: { presets: ['es2015', 'react'] }
      },
      {
        test: /\.scss$/,
        include: path.join(__dirname, 'src/scss'),
        // extract the output of CSS processing into a css file loaded by a link tag
        loader: ExtractTextPlugin.extract(['css', 'sass']),
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.(png|jpg|gif)$/,
        // export any images larger than 1kb as files rather than bundling as data urls
        loader: 'url-loader?limit=1024&name=images/[name].[ext]'
      },
      {
        test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: 'file-loader'
      }
    ]
  },
  externals: {
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': true
  },
	/* configuration for local dev node server */
	devServer: {
		historyApiFallback: true,
		/**
		 * mock json responses to various endpoint requests for development
		 * @param app
		 */
		setup: function(app) {
			/**
			 * redirect dev requests for jwt tokens to the corresponding role json file
			 * this enables getting different tokens containing roles that affect app behavior
			 */
			app.get('/apspahbx/api-auth/jwt-token/:role', function(req, res) {
				res.redirect('/data/jwt_token_' + req.params.role + '.json');
			});
			// respond locally to application endpoint GET
			app.get('/ahbx/application-service/v1/application', function(req, res) {
				res.redirect('/data/application.json');
			});
			// respond locally to application endpoint POST
			app.post('/ahbx/application-service/v1/alt/application', function(req, res) {
				res.redirect(303, '/data/application.json');
			});
			// respond locally to application endpoint PUT
			app.put('/ahbx/application-service/v1/application', function(req, res) {
				res.redirect(303, '/data/application.json');
			});
			app.post('/data/identity_response.json', function (req, res) {
				res.redirect('/data/identity_response.json');
			});
			app.get('/ahbx/income-service/v1/household', function(req, res) {
				res.redirect('/data/household.json');
			});
			app.get('/ahbx/household-service/v1/household/enrollment/period', function(req, res) {
				res.redirect('/data/enrollment_period.json');
			});
			app.post('/ahbx/household-service/v1/household/ridp', function(req, res) {
				res.redirect('303', '/data/identity_response.json');
			});
			app.get('/ahbx/accountmanagement-service/v1/zipCode/:zipcode/counties', function (req, res) {
				var zipcode = req.params.zipcode, apiUrl = [
					'/data/zipcode_lookup_',
					zipcode === '00000' ? 'valid_no_county' : '',
					zipcode === '11111' ? 'valid_single' : '',
					zipcode === '22222' ? 'valid_multi' : '',
					zipcode === '55555' ? 'invalid_ca' : ''
				].join('');
				apiUrl += (apiUrl === '/data/zipcode_lookup_') ? 'valid_no_county' : '.json';
				res.redirect(apiUrl);
			});
			app.get('/ahbx/household-service/v1/household/persons', function (req, res) {
				res.redirect('/data/household.json');
			});
			app.get('/ahbx/household-service/v1/household/person/:personId', function (req, res) {
				res.redirect('/data/household_person_get.json');
			});
			app.post('/ahbx/household-service/v1/household/person', function (req, res) {
				res.redirect(303, '/data/household_person_post.json');
			});
			app.put('/ahbx/household-service/v1/household/person/:optional*?', function (req, res) {
				res.redirect(303, '/data/household_person_post.json');
			});
			app.get('/ahbx/citizenship-service/v1/citizenship/countries', function(req, res) {
				res.redirect('/data/countries.json');
			});
			app.get('/ahbx/household-service/v1/household/specialEnrollment', function(req, res) {
				res.redirect('/data/special_enrollment.json');
			});
			app.get('/ahbx/household-service/v1/household/person/accountowner', function(req, res) {
				res.redirect('/data/account_owner.json');
			});
			app.get('/ahbx/appsignature-service/v1/application/signature/:mode*?', function(req, res) {
				if(req.params.mode === 'rac') {
					return res.redirect('/data/application_signature_rac.json');
				}
				return res.redirect('/data/application_signature.json');
			});
			app.post('/ahbx/appsignature-service/v1/application/signature/:mode*?', function(req, res) {
				if(req.params.mode === 'rac') {
					return res.redirect('/data/application_signature_rac.json');
				}
				var body = [];
				req.on('data', function(chunk) {
					body.push(chunk);
				}).on('end', function() {
					body = JSON.parse(Buffer.concat(body).toString());
					var pinFile = body.appSignature.electronicPIN === '9999' ? 'application_signature_invalid_pin.json' : 'application_signature_post.json';
					res.redirect(303, '/data/'+ pinFile);
				});
			});
			app.get('/ahbx/household-service/v1/household/ridp/file', function(req, res) {
				res.redirect('/data/uploaded_files.json');
			});
			app.get('/ahbx/healthcare-service/v1/healthcare/application/bre/esi', function(req, res) {
				res.redirect('/data/healthcare_esi.json');
			});
			app.get('/ahbx/household-service/v1/household/state/:stateCode/tribes', function(req, res) {
				setTimeout(() => {
					res.redirect('/data/tribes.json');
				}, 2000);
			});
			app.get("/ahbx/enrollment-service/v1/enrollment/healthGroups", function(req, res){
				res.redirect("/data/enrollment_groups.json");
			});
			app.get("/ahbx/home-service/v1/alt/application/casestate", function(req, res){
				res.redirect("/data/user_home.json");
			});
			app.get("/ahbx/home-service/v1/application/casestate", function(req, res){
				res.redirect("/data/user_home.json");
			});
			app.put('/ahbx/accountmanagement-service/v1/password/validation', function(req, res) {
				var body = [];
				req.on('data', function(chunk) {
					body.push(chunk);
				}).on('end', function() {
					body = JSON.parse(Buffer.concat(body).toString());
					var passwordFile = body.password === 'Invalid123#' ? 'password_invalid.json' : 'password_valid.json';
					res.redirect(303, '/data/'+ passwordFile);
				});
			});
			// blank body 
			app.get('/ahbx/application-service/v1/application/checkpoint|checkpointwo|checkpointthree|checkpointfour', function(req, res) {
				res.status(200).send({});
			});
			app.put('/ahbx/healthcare-service/v1/healthcare/application/person/enrollment/:endpoint', function(req, res) {
				res.status(200).send({});
			});
			app.get('/ahbx/appsignature-service/v1/application/voterregistration', function(req, res) {
				res.status(200).send({});
			});
			app.post('/ahbx/appsignature-service/v1/application/voterregistration', function(req, res) {
				res.status(200).send({});
			});
			app.post('/ahbx/home-service/v1/application/withdraw', function(req, res) {
				res.redirect(303,'/data/withdraw_application.json');
			});
			app.post('/ahbx/home-service/v1/application/withdraw/rac', function(req, res) {
				res.redirect(303,'/data/withdraw_rac.json');
			});
			app.post('/ahbx/application-service/v1/application/renewal', function(req, res) {
				res.status(200).send({});
				// return res.redirect('/data/application_signature_rac.json');
			});
			app.post('/ahbx/application-service/v1/alt/application/rac', function(req, res) {
				res.status(200).send({});
				// return res.redirect('/data/application_signature_rac.json');
			});
		}
	}
};
