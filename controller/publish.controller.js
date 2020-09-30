'use strict';
const starws = require('../services/star-ws/controller');
const nodeMapper = require('../mapper/inbound.mapper');

const publish = async (req, res) => {
  const data = req.body;

  const isDataFormatted =
    Array.isArray(data) && data.dateTime && data.fields && data.tags;

  if (isDataFormatted) {
    const starwsResp = await starws.publishMetrics(data);
    res.send(starwsResp);
    return false;
  }

  // TODO: Means that is not formatted, lets mapper it

  res.send({});
};

module.exports = publish;
