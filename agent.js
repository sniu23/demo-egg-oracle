'use strict';

const oracle = require('./lib/oracle');

module.exports = agent => {
  if (agent.config.oracle.agent) oracle(agent);
};