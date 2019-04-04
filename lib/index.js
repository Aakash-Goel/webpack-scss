'use strict';

const RootHelper = require('./root-helper');
exports.getRoot  = RootHelper.getRoot;
exports.setRoot  = RootHelper.setRoot;

exports.getBuildEnvironment = require('./get-build-environment').getBuildEnvironment;
