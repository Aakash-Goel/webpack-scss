'use strict';

const path              = require('path');
const webpack           = require('webpack');
// const webpackMerge      = require('webpack-merge'); // used to merge webpack configs
const open              = require('open');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
// const CopyWebpackPlugin = require('copy-webpack-plugin');
const projectConfig     = require('../project.config');

/**
 * Build the metadata object. This is an options object that is passed to the webpack build files
 * to properly create the webpack configuration. This object should also contain any data we may want to pass into the
 * body of the HTML file like a build number, sha, tag name, and/or date.
 *
 * It must contain the following properties:
 * projectRoot: the root directory path of the current project
 *
 * This object should also be used to override buildEnvironment parameters:
 * host: host to bind dev environment to (usually set with cli argument --host=<host>
 * port: port to bind dev environment to (usually set with cli argument --port=<host>
 * production: flag to enable production build (usually set with cli argument --production=
 * development: flag to enable development build (usually set with cli argument --development
 * open: flag to automatically open the browser during build (usually set with cli argument --open
 * api_endpoint: path used to proxy all API calls to (usually set with cli argument --api-endpoint=<url>
 */
const metadata = {
	projectRoot: projectConfig.projectRoot
};
const buildEnvironment = require('../lib').getBuildEnvironment(metadata);

/**
 * We need to define the index.html file we want to load when doing a development build. This file will be served up
 * by webpack when performing a development build.
 *
 * @TODO: moved the path defination to 'project.config.js' file
 */
const indexHTML = path.join(projectConfig.projectSrc, 'index.html');

let projectWebpackConfig = {
	/**
	 * The base webpack config does not assume any entry points or bundles. You must add them here or nothing will be
	 * built. Use an array to pull in multiple entry points into a bundle. The bundles configured here are defaults and
	 * should probably be changed on a per-project basis. Please follow webpack configuration documentation.
	 */
	entry: {
		'app': ['./src/main.js']
	},

	/**
	 * The base webpack config does not assume any output options. You must configure your output if you want the output
	 * to be directed to a specific location. This should probably be changed on a per-project basis. Please follow
	 * webpack configuration documentation.
	 */
	output: {
		path: projectConfig.projectDist,
		publicPath: '/',
		filename: '[name].js',
		chunkFilename: '[id].chunk.js'
	},

	/*
	 * Options affecting the resolving of modules.
	 *
	 * See: http://webpack.github.io/docs/configuration.html#resolve
	 */
	resolve: {
		/*
		 * An array of extensions that should be used to resolve modules.
		 *
		 * See: http://webpack.github.io/docs/configuration.html#resolve-extensions
		 *
		 * @TODO: can add more. subject to review
		 */
		extensions: ['', '.js', '.json'],

		root: metadata.projectRoot,

		// remove other default values
		modulesDirectories: ['node_modules']
	},

	devtool: 'source-map',

	devServer: {
		historyApiFallback: true,
		stats: 'minimal'
	},

	module: {
		/**
		 * An array of applied loaders.
		 *
		 * See: http://webpack.github.io/docs/configuration.html#module-preloaders-module-postloaders
		 */
		loaders: [
			/**
			 * Html loader support for *.html
			 * Returns file content as string, and minimizing the HTML when required.
			 *
			 * This cannot be included in the common webpack configuration because we need to add
			 * an exclude when we are using the HTMLWebpackPlugin.
			 *
			 * See: https://github.com/webpack/html-loader
			 */
			{
				test: /\.html$/,
				loader: 'html',
				exclude: [indexHTML]
			},

			/**
			 * Raw loader support for *.scss files
			 * Returns file content as string
			 *
			 * See: https://github.com/webpack/raw-loader
			 */
			// {
			// 	test: /\.scss$/,
			// 	include: projectConfig.webpackConfig.componentStylesFolder,
			// 	loader: 'raw!postcss!sass'
			// },

			{
				test: /\.(sass|scss)$/,
				loader: ExtractTextPlugin.extract('css!postcss!sass')
			}
		]
	},

	/**
	 * Html loader advanced options
	 *
	 * See: https://github.com/webpack/html-loader#advanced-options
	 */
	htmlLoader: {
		minimize: true,
		removeAttributeQuotes: false,
		caseSensitive: true,
		customAttrSurround: [
			[/#/, /(?:)/],
			[/\*/, /(?:)/],
			[/\[?\(?/, /(?:)/]
		],
		customAttrAssign: [/\)?\]?=/]
	},

	/**
	 * SASS loader configuration
	 *
	 * See: https://github.com/jtangelder/sass-loader
	 */
	sassLoader: {
		'includePaths': projectConfig.webpackConfig.sassLoaderIncludes
	},

	/**
	 * PostCSS loader for webpack
	 *
	 * See: https://github.com/postcss/postcss-loader
	 */
	postcss: function() {
		return [autoprefixer({
			browsers: [
				'> 5%',
				'last 2 versions',
				'Firefox ESR',
				'Opera 12.1',
				'ie >= 11',
				'ios > 6',
				'Android >= 4.4',
				'not ie <= 10',
				'not op_mini 5.0-8.0'
			]
		})];
	},

	/**
	 * Set up dev server to use build environment variables.
	 */
	devServer: {
		port: '8080'
	},

	/*
	 * Include polyfills or mocks for various node stuff
	 * Description: Node configuration
	 *
	 * See: https://webpack.github.io/docs/configuration.html#node
	 */
	// node: {
	// 	global: true,
	// 	process: true,
	// 	module: false,
	// 	clearImmediate: false,
	// 	setImmediate: false
	// },

	/**
	 * The base webpack config adds the below plugins. If you would like to add more, like the commons chunk plugin, you
	 * will need to define them here.
	 *
	 * Dev Plugins are:
	 * new DefinePlugin(metadata),
	 * new ProgressBarPlugin({
	 *   format: 'build [:bar] :percent (:elapsed seconds): :msg'
	 * }),
	 * new ForkCheckerPlugin(),
	 * new webpack.optimize.OccurenceOrderPlugin(true),
	 *
	 * Prod Plugins are:
	 * new DefinePlugin(metadata),
	 * new ProgressBarPlugin({
	 *   format: 'build [:bar] :percent (:elapsed seconds): :msg'
	 * }),
	 * new ForkCheckerPlugin(),
	 * new webpack.optimize.OccurenceOrderPlugin(true),
	 * new webpack.NoErrorsPlugin(),
	 * new webpack.optimize.DedupePlugin(),
	 * new webpack.optimize.UglifyJsPlugin({
	 *   compress: {
	 *     warnings: false
	 *   }
	 * }),
	 */
	plugins: [
		/**
		 * This plugin provides a common progress bar implementation for all build types. This is necessary to give
		 * developers feedback regarding the build process...which can take a few seconds and may appear locked up without
		 * a progress indicator of some kind.
		 *
		 * See: https://github.com/clessg/progress-bar-webpack-plugin
		 */
		new ProgressBarPlugin({
			format: 'build [:bar] :percent (:elapsed seconds): :msg'
		}),

		/*
		 * Plugin: OccurenceOrderPlugin
		 * Description: Varies the distribution of the ids to get the smallest id length
		 * for often used ids.
		 *
		 * See: https://webpack.github.io/docs/list-of-plugins.html#occurrenceorderplugin
		 * See: https://github.com/webpack/docs/wiki/optimization#minimize
		 */
		//  new webpack.optimize.OccurenceOrderPlugin(true),

		// Create a commons chunk from the chunks listed
		// new webpack.optimize.CommonsChunkPlugin({
		// 	name: ['app']
		// }),

		/**
		 * Plugin: HtmlWebpackPlugin
		 * Description: Host an index.html file. Important for local builds when using webpack dev server.
		 * This can stay here even for prod builds.
		 *
         * This plugin simplifies generation of `index.html` file. Especially useful for production environment,
         * where your files have hashes in their names.
         *
         * We have auto-injection disabled here, otherwise scripts will be automatically inserted at the end
         * of `body` element.
         *
         * See https://www.npmjs.com/package/html-webpack-plugin.
         *
         * @TODO: Google Analytics and other stuff like that
         */
		new HtmlWebpackPlugin({
			template: indexHTML,
			chunksSortMode: 'dependency'
		}),

		new ExtractTextPlugin('[name].css')
	]
};

if (buildEnvironment.open) {
	setTimeout(function() {
		open(`http://${buildEnvironment.host || 'localhost'}:${buildEnvironment.port || '8080'}`);
	}, 300);
}

// Compile the webpack config and print to console for debugging purposes
// const compiledConfig = webpackMerge.smart(baseWebpackConfig, projectWebpackConfig);
console.log('Webpack Configuration:');
// console.log(JSON.stringify(projectWebpackConfig, null, 2));

module.exports = projectWebpackConfig;
