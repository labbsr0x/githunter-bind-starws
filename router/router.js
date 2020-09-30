'use strict';

const express = require('express');
const metricsController = require('../controller/metrics.controller');
const publishController = require('../controller/publish.controller');

const init = middlewares => {
  const router = express.Router();

  if (middlewares) {
    middlewares.forEach(middleware => router.use(middleware));
  }

  router.post('/publish', publishController);
  router.get('/metrics', metricsController);

  // router.post("/save/data", {}); // Save JSON DATA

  return router;
};

module.exports = init;
