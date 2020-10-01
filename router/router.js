'use strict';

const express = require('express');
const jsonDataController = require('../controller/json.data.controller');
const metricsController = require('../controller/metrics.controller');
const publishController = require('../controller/publish.controller');

const init = middlewares => {
  const router = express.Router();

  if (middlewares) {
    middlewares.forEach(middleware => router.use(middleware));
  }

  router.post('/publish/provider/:provider/node/:node', publishController);
  router.get('/metrics', metricsController);

  router.post('/upload/jsondata', jsonDataController);

  return router;
};

module.exports = init;
