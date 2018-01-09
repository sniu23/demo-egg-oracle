'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/select', controller.home.select);
  router.get('/count', controller.home.count);
  router.get('/get', controller.home.get);
  router.get('/select2', controller.home.select2);
  router.get('/insert', controller.home.insert);
  router.get('/update', controller.home.update);
  router.get('/delete', controller.home.delete);
  router.get('/query', controller.home.query);
  router.get('/busness', controller.home.busness);
  router.get('/transaction', controller.home.transaction);
};
