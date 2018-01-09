'use strict';

const oracle = require('./lib/oracle');

module.exports = app => {
  if (app.config.oracle.app) oracle(app);
};