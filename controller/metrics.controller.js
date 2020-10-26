'use strict';
const starws = require('../services/star-ws/controller');
const nodeMapper = require('../mapper/outbound.mapper');

const metrics = async (req, res) => {
  const { provider, node, startDateTime, endDateTime } = req.query;

  const starwsResp = await starws.metrics(provider, node, {
    startDateTime,
    endDateTime,
  });

  if (
    !starwsResp ||
    (starwsResp.data &&
      starwsResp.data.data &&
      starwsResp.data.data.lenght == 0)
  ) {
    res.send({ message: 'No data found' });
    return false;
  }

  if (starwsResp.status && starwsResp.status != 200) {
    res.status(starwsResp.status).send({ message: 'Unknown error' });
    return false;
  }

  const maker = nodeMapper[node];

  if (!maker) {
    res.send({ data: starwsResp.data.data });
    return false;
  }

  // Get JSON Data
  const rawDataPromise = [];
  starwsResp.data.data.forEach((theData, index) => {
    if (theData.attributes && theData.attributes.rawData)
      rawDataPromise[index] = starws.getJSONData(theData.attributes.rawData);
  });

  const rawDataValues = await Promise.all(rawDataPromise);

  const data = [];
  starwsResp.data.data.forEach((item, index) => {
    let theData = maker(item);

    if (theData && rawDataValues[index]) {
      theData = { ...theData, ...rawDataValues[index] };
    }
    data.push(theData);
  });

  res.send({ data });
};

module.exports = metrics;
