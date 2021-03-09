'use strict';
const logger = require('../config/logger');
const starws = require('../services/star-ws/controller');

const jsonData = async (req, res) => {
  const { provider, node } = req.params;
  const data = req.body;

  if (!data) {
    logger.error(`JSON DATA CONTROLLER: Data content is invalid!`);
    res.status(204).send();
  }

  const starwsResp = await starws.saveJSONData(provider, node, data);

  if (starwsResp && starwsResp.status != 200 && starwsResp.data) {
    res.send({ status: starwsResp.status, data: starwsResp.data });
    return;
  }

  res.send(starwsResp);
};

module.exports = jsonData;
