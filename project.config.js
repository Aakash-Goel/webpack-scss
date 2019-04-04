'use strict';

const path = require('path');

module.exports = {

	/**
	 * the root directory path of the current project.
	 * required for webpack metadata object
	 */
	projectRoot: path.resolve(__dirname),

	/**
	 * the distribution directory where all the compiled code generate.
	 */
	projectDist: path.join(__dirname, 'dist'),

	/**
	 * the source directory where application code reside.
	 */
	projectSrc: path.join(__dirname, 'src'),

	webpackConfig: {
		jsExclude: [
			path.resolve(__dirname, 'node_modules')
		],

		/**
		 * @for: SASS loader configuration
		 * @description: resolve paths against import/require statement when use in .scss files.
		 * @uses: using ES6 `@import "~normalize.css";`
		 * `~` indicate webpack to resolve path against list of include paths.
		 *
		 * See: https://github.com/jtangelder/sass-loader
		 */
		sassLoaderIncludes: [
			path.resolve(__dirname, 'node_modules', 'normalize.css'),
			path.resolve(__dirname, 'node_modules', 'include-media/dist/')
		],

		/**
		 * @for: files using `.scss` extension
		 * @description: compile sass files into css, filters for component-scoped styles and loads them.
		 * and exculde any `.scss` file present outside of 'src/app' folder.
		 * @uses: Using Webpack loader, two patterns
		 * The first pattern excludes `.scss` files within the `/src/app` directories where our component-based style sits.
		 * It includes only `.scss` files located at or above /src; these are the application-wide styles.
		 * The `ExtractTextPlugin` applies the css-loader, postcss-loader and sass-loader to these files.
		 *
		 * The second pattern filters for component-scoped styles and loads them as strings via raw loader (with postcss-loader and sass-loader)
		 * which is what Angular expects to do with styles specified in a styleUrls/styles metadata property.
		 */
		styleFiles: [
			path.resolve(__dirname, 'src/**/*')
		]
	}
};
