'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1515036832178_1144';

  config.oracle = {
    default: {
      database: null,
      connectionLimit: 5,
    },
    // Single Database
    client: {
      user: 'USER',
      password: 'PASSWORD',
      connectString: '127.0.0.1:1521/tns',
    },
    app: true,
    agent: false,
  };

  // add your config here
  config.middleware = [];

  return config;
};

