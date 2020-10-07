'use strict';
const starws = require('../services/star-ws/controller');

const jsonData = async (req, res) => {
  const data = req.body;

  const starwsResp = await starws.saveJSONData(data);
  res.send(starwsResp);
};

module.exports = jsonData;
