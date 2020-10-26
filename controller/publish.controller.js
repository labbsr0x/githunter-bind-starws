'use strict';
const starws = require('../services/star-ws/controller');
const nodeMapper = require('../mapper/inbound.mapper');
const logger = require('../config/logger');
const utils = require('../utils');

const publish = async (req, res) => {
  const sourceData = req.body;
  const { provider, node } = req.params;
  const { createRawData = false } = req.query;

  if (!Array.isArray(sourceData)) {
    logger.error(`PUBLISH CONTROLLER: Body data must be an array.`);
    res.send({ message: 'Body data must be an array.' });
    return false;
  }

  const checksum = sourceData.reduce((acc, item) => {
    if (item.dateTime && item.fields && item.tags) {
      acc += 1;
    }
    return acc;
  }, 0);

  if (checksum > 0 && checksum == sourceData.length) {
    // data formatted correctly
    const starwsResp = await starws.publishMetrics(provider, node, sourceData);
    if (starwsResp) {
      res.status(starwsResp.status).send(starwsResp.data);
    } else {
      logger.error(`PUBLISH CONTROLLER: Error publishing data.`);
      res.status(500).send({ message: 'Error publishing data.' });
    }
    return false;
  } else if (checksum != 0 && checksum != sourceData.length) {
    //data formatted incorrectly
    logger.error(`PUBLISH CONTROLLER: Some array item is missing dateTime, fields or tags data.`);
    res.send({
      message: 'Some array item is missing dateTime, fields or tags data.',
    });
    return false;
  }

  // TODO: Means that is not formatted, lets mapper it
  let rawDataValues;
  if (createRawData) {
    // Save JSON Data
    const rawDataPromise = [];
    sourceData.forEach((theData, index) => {
      rawDataPromise[index] = starws.saveJSONData(theData);
    });

    rawDataValues = await Promise.all(rawDataPromise);
  }

  const theMaker = nodeMapper[node];
  if (!theMaker) {
    logger.error(`PUBLISH CONTROLLER: Wrong data format, no mapper for this node ${node}`);
    res.send({
      message: `Wrong data format, no mapper for this node ${node}`,
      data: sourceData,
    });
    return false;
  }
  const data = [];
  sourceData.forEach((item, index) => {
    let d = item;
    if (rawDataValues) {
      d = {
        ...item,
        rawData: rawDataValues[index].link,
      };
    }
    data.push(theMaker(d));
  });

  utils.dateCounter = 0;
  const starwsResp = await starws.publishMetrics(provider, node, data);
  if (starwsResp) {
    res.status(starwsResp.status).send(starwsResp.data);
    return false;
  }

  logger.error(`PUBLISH CONTROLLER: Error publishing data.`);
  res.status(500).send({ message: 'Error publishing data.' });
};

module.exports = publish;
