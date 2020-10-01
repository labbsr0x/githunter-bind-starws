'use strict';
const starws = require('../services/star-ws/controller');
const nodeMapper = require('../mapper/inbound.mapper');

const publish = async (req, res) => {
  const sourceData = req.body;
  const { provider, node } = req.params;

  if (!Array.isArray(sourceData)) {
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
      res.status(500).send({ message: 'Error publishing data.' });
    }
    return false;
  } else if (checksum != 0 && checksum != sourceData.length) {
    //data formatted incorrectly
    res.send({
      message: 'Some array item is missing dateTime, fields or tags data.',
    });
    return false;
  }

  // TODO: Means that is not formatted, lets mapper it
  const theMaker = nodeMapper[node];
  if (!theMaker) {
    res.send({
      message: `Wrong data format, no mapper for this node ${node}`,
      data: sourceData,
    });
    return false;
  }
  const data = [];
  sourceData.forEach(item => {
    data.push(theMaker(item));
  });

  const starwsResp = await starws.publishMetrics(provider, node, data);
  if (starwsResp) {
    res.status(starwsResp.status).send(starwsResp.data);
    return false;
  }

  res.status(500).send({ message: 'Error publishing data.' });
};

module.exports = publish;
