#!/usr/bin/env node
var QUnit = require('qunitjs');
global.QUnit = QUnit;
require('qunit-extras').runInContext(global);
require('../tests/index.js');

// run tests
QUnit.load();
