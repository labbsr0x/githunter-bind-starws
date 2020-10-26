'use strict';
const logger = require('../config/logger');
const starws = require('../services/star-ws/controller');

const jsonData = async (req, res) => {
  const data = req.body;

  if (!data) {
    logger.error(`JSON DATA CONTROLLER: Data content is invalid!`);
    res.status(401).send({ msg: 'Data content is invalid' });
  }

  const starwsResp = await starws.saveJSONData(data);
  res.send(starwsResp);
};

module.exports = jsonData;
