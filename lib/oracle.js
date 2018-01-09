'use strict';

const assert = require('assert');
const rds = require('./client');

let count = 0;

module.exports = app => {
  app.addSingleton('oracle', createOneClient);
};

function createOneClient(config, app) {
  assert(config.connectString && config.user && config.password,
    `[egg-oracle] 'connectString: ${config.connectString}', 'user: ${config.user}', 'password: ${config.password}' are required on config`);

  app.coreLogger.info('[egg-oracle] connecting %s@%s:%s',
    config.user, config.password, config.connectString);
  const client = rds(config);

  app.beforeStart(function* () {
    yield client.createPool();
    const rows = yield client.query('select sysdate from dual where 1=1');
    const index = count++;
    app.coreLogger.info(`[egg-oracle] instance[${index}] status OK, rds currentTime: ${rows[0].SYSDATE}`);
  });
  return client;
}