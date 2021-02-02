'use strict';

const _ = require("lodash");
const async = require('async');
const starws = require('../services/star-ws/controller');
const nodeMapper = require('../mapper/outbound.mapper');
const logger = require('../config/logger');

const metrics = async (req, res) => {
  const { provider, node, startDateTime, endDateTime } = req.query;
  const { filters } = req.body;

  let filter = '';
  if (filters) {
    filter = filters.map(item => Object.keys(item).map(key => `${key}:${item[key]}`)).join();
  }

  const starwsResp = await starws.metrics(provider, node, {
    startDateTime,
    endDateTime,
    filter,
  });

  if (
    starwsResp &&
    (!starwsResp.data ||
      !starwsResp.data.data ||
      starwsResp.data.data.length === 0)
  ) {
    logger.info(`METRICS CONTROLLER: No content data.`);
    res.status(204).send();
    return false;
  }

  if (!starwsResp || (starwsResp.data && !starwsResp.data.data)) {
    res
      .status(starwsResp && starwsResp.status ? starwsResp.status : 500)
      .send({ message: 'Unknown error', data: starwsResp && starwsResp.data? starwsResp.data : null });
    return false;
  }

  const maker = nodeMapper[node];

  if (!maker) {
    logger.error(`METRICS CONTROLLER: Node is invalid.`);
    res.status(400).send({ data: starwsResp.data.data });
    return false;
  }

  // Get JSON Data
  const rawUrls = starwsResp.data.data.map(data => {
    if (
      data.attributes &&
      data.attributes.rawData &&
      data.attributes.rawData !== 'https://datajson/empty'
    ) {
      return data.attributes.rawData;
    }
  });

  const rawDataValues = [];

  // Limiting to 10 per time the request to client (infra problem)
  await async.eachLimit(rawUrls, 1000, (url, done) => {
    starws
      .getJSONData(url)
      .then(response => {
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
      theData = _.merge(theData, _.omitBy(rawDataValues[index], _.isEmpty));
    }
    data.push(theData);
  });

  res.status(200).send({ data });
};

module.exports = metrics;
