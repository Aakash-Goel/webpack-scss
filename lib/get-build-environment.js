'use strict';

var _            = require('lodash');
var childProcess = require('child_process');

var defaultOptions = {
    baseUrl     : '/',
    production  : false,
    development : true,
    host        : 'localhost',
    port        : '8080',
    open        : false,
    apiEndpoint : false,
    skipGit     : true
};
/**
 * Returns build metadata taking into account flags and parameters passed via the
 * command line. Optional overrides may also be passed to this function.
 * @return {object} build metdata object
 */
function getBuildEnvironment(options) {
	if (options == null) {
		options = {};
	}

	var envOptions = getEnvironmentOptions();
	var args = _.assign({}, options, envOptions);
	if (args.production === true) {
		// --production
		args.host = args.port = '';
		args.environment = 'production';

	} else {
		// --development
		args.environment = 'development';
	}

	if (!args.skipGit) {
		args.gitInfo = getGitInfo();
	} else {
		args.gitInfo = {};
	}

	return args;
}

/**
 * getEnvironmentOptions retrieves options that may be set via environment variables.
 */
function getEnvironmentOptions() {
	var envOptions = defaultOptions;

	if (/^prod(uction)?$/i.test(process.env.ENV)) {
		envOptions.production = true;
		envOptions.development = false;
	}

	if (!_.isEmpty(process.env.HOST)) {
		envOptions.host = process.env.HOST;
	}

	if (!_.isEmpty(process.env.PORT)) {
		envOptions.port = process.env.PORT;
	}

	if (/^true$/i.test(process.env.OPEN)) {
		envOptions.open = true;
	}

	if (!_.isEmpty(process.env.API_ENDPOINT)) {
		envOptions.apiEndpoint = process.env.API_ENDPOINT;
	}

	if (!_.isEmpty(process.env.SKIP_GIT)) {
		envOptions.skipGit = process.env.SKIP_GIT;
	}

	return envOptions;
}

/**
 * getGitInfo retrieves the git info data for the current repository
 */
function getGitInfo() {
	let gitInfo = {};

	try {
		gitInfo.hash          = execShell('git rev-parse --short HEAD').trim();
		gitInfo.currentBranch = execShell('git rev-parse --abbrev-ref HEAD').trim();
		gitInfo.tag           = execShell('git describe --tags').trim();
		gitInfo.commitDate    = execShell('git log --date=local -1 --pretty=tformat:\'%cd\'').trim();
	} catch (err) {
		console.warn(err);
	}

	return gitInfo;
}

function execShell(script, options) {
	if (!script) {
		return '';
	}
	// Add a timeout to options by default
	options = Object.assign({}, {
		timeout: 300
	}, options);

	try {
		return childProcess.execSync(script, options).toString();
	} catch (err) {
		return '';
	}
}

exports.getBuildEnvironment = getBuildEnvironment;
