'use strict';
const starws = require('../services/star-ws/controller');
const nodeMapper = require('../mapper/outbound.mapper');
const logger = require('../config/logger');

const metrics = async (req, res) => {
  const { provider, node, startDateTime, endDateTime } = req.query;

  const starwsResp = await starws.metrics(provider, node, {
    startDateTime,
    endDateTime,
  });

  if (
    !starwsResp.data ||
    !starwsResp.data.data ||
    starwsResp.data.data.length === 0
  ) {
    logger.info(`METRICS CONTROLLER: No content data.`);
    res.status(204).send();
    return false;
  }

  if (starwsResp.data && !starwsResp.data.data) {
    res
      .status(starwsResp.status ? starwsResp.status : 500)
      .send({ message: 'Unknown error', data: starwsResp.data });
    return false;
  }

  if (starwsResp.status && starwsResp.status != 200) {
    res.status(starwsResp.status).send({ message: 'Unknown error' });
    return false;
  }

  const maker = nodeMapper[node];

  if (!maker) {
    logger.error(`METRICS CONTROLLER: Node is invalid.`);
    res.status(400).send({ data: starwsResp.data.data });
    return false;
  }

  // Get JSON Data
  const rawUrls = starwsResp.data.data.map((data) => {
    if (data.attributes && data.attributes.rawData && data.attributes.rawData !== 'https://datajson/empty') {
      return data.attributes.rawData;
    }
  });

  const rawDataValues = [];

  await async.eachLimit(rawUrls, 10, (url, done) => {
    starws.getJSONData(url)
    .then((response) => {
      if (response) {
        rawDataValues.push(response);
      }
      return done();
    })
    .catch(err => logger.error(err));
  });

  const data = [];
  starwsResp.data.data.forEach((item, index) => {
    let theData = maker(item);

    if (theData && rawDataValues[index]) {
      theData = { ...theData, ...rawDataValues[index] };
    }
    data.push(theData);
  });

  res.status(200).send({ data });
};

module.exports = metrics;
