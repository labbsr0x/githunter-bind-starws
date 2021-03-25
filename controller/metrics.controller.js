'use strict';

const _ = require('lodash');
const async = require('async');
const starws = require('../services/star-ws/controller');
const nodeMapper = require('../mapper/outbound.mapper');
const logger = require('../config/logger');

String.prototype.hashCode = function () {
  var hash = 0,
    i,
    chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

const metrics = async (req, res) => {
  try {
    const { node, startDateTime, endDateTime } = req.query;
    let { provider } = req.query;
    const { filters } = req.body;

    let filter = '';
    if (filters && filters.length > 0) {
      filter = filters
        .map(item => Object.keys(item).map(key => `${key}:${item[key]}`))
        .join();
    }

    // If provider is has *, lets get the owners in agrows
    // For now only accept the '*' in the end of string: labbsr0x*
    if (provider.indexOf('*') !== -1) {
      const listOwners = await starws.getThings();
      if (!Array.isArray(listOwners)) {
        throw listOwners;
      }
      const ownerFilter = provider.replace('*', '');
      if (ownerFilter.length == 0) {
        //means no filter
        provider = listOwners;
      } else {
        // apply the filter
        provider = listOwners.filter(o => o.includes(ownerFilter));
      }

      if (provider.length == 0) {
        logger.info(
          `METRICS CONTROLLER: No owner data for filter: ${ownerFilter}`,
        );
        res.status(204).send();
        return false;
      }
      provider = provider.join(',');
    }

    const starwsResp = await starws.metrics(
      provider,
      node,
      filter
        ? {
            startDateTime,
            endDateTime,
            filter,
          }
        : {
            startDateTime,
            endDateTime,
          },
    );

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
        .send({
          message: 'Unknown error',
          data: starwsResp && starwsResp.data ? starwsResp.data : null,
        });
      return false;
    }

    const maker = nodeMapper[node];

    if (!maker) {
      logger.error(`METRICS CONTROLLER: Node is invalid.`);
      res.status(400).send({ data: starwsResp.data.data });
      return false;
    }

    // Get JSON Data
    let rawUrls = starwsResp.data.data.map(data => {
      if (
        data.attributes &&
        data.attributes.rawData &&
        data.attributes.rawData !== 'https://datajson/empty'
      ) {
        return data.attributes.rawData;
      }
    });

    let rawDataValues = new Map();

    let emptyTimes = 0;
    while (rawUrls.length > 0 && emptyTimes < 10) {
      const { failsRawUrls, rawData } = await loadRawData(rawUrls);
      if (rawData.size > 0) {
        rawDataValues = _.merge(rawDataValues, rawData);
      }
      rawUrls = failsRawUrls;
      emptyTimes++;
    }

    const data = [];
    starwsResp.data.data.forEach(item => {
      let theData = maker(item);

      const rawData = rawDataValues.get(theData.rawData.hashCode());
      if (theData && rawData) {
        theData = _.merge(theData, _.omitBy(rawData, _.isEmpty));
      }
      data.push(theData);
    });

    res.status(200).send({ data });
  } catch (e) {
    logger.error(`METRICS CONTROLLER: Error getting metrics.`);
    logger.error(e);
    res.status(500).send({
      message: e && e.message ? e.message : 'Error getting metrics.',
      config: e && e.config ? e.config : undefined,
    });
  }
};

const loadRawData = async rawUrls => {
  const rawData = new Map();
  const failsRawUrls = [];
  const knownsError = ['ECONNRESET', 'ECONNABORTED', 'ETIMEDOUT'];
  // Limiting to 10 per time the request to client (infra problem)
  await async.eachLimit(rawUrls, 1000, (url, done) => {
    starws
      .getJSONData(url)
      .then(response => {
        if (
          response &&
          ((response.code && knownsError.includes(response.code)) ||
            (response.errno && knownsError.includes(response.errno)))
        ) {
          failsRawUrls.push(url);
          return done();
        } else if (response) {
          if (response.code)
            logger.warn(`Possible unknown error code: ${response.code}`);
          rawData.set(url.hashCode(), response);
        }
        return done();
      })
      .catch(err => logger.error(err));
  });

  return { failsRawUrls, rawData };
};

module.exports = metrics;
