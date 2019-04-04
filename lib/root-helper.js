'use strict';

var path = require('path');
var _    = require('lodash');

// Private variables
var _root = path.resolve(__dirname, '..');

/**
 * Retrieve the current root path value.
 * @return {string} current root path
 */
exports.getRoot = function getRoot() {
	return _root;
};

/**
 * Update root to a specific path.
 * @param  {object} options Options object:
 * {
 *   newRoot: string path of new root directory
 * }
 */
exports.setRoot = function setRoot(options) {
	var newRoot = options.newRoot || '';

	if (_.isEmpty(newRoot)) {
		throw new Error('setRoot requires newRoot to be passed as part of the options parameter');
	}

	_root = newRoot;
};
