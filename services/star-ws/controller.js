const qs = require('qs');
const moment = require('moment');
const config = require('config');
const Route = require('route-parser');
const HttpClient = require('../rest/RESTClient');
const env = require('../../infra/env');
const logger = require('../../config/logger');

const starwsConfig = config.get('star-ws');
const httpClient = new HttpClient({
  url: starwsConfig.urlData,
  headers: starwsConfig.headers,
});

// TODO: Use percentage of expires_in
const isTokenExpired = () => {
  // Fist time for authentication
  if (!env.starwsAuth) return true;

  const expiresIn = env.starwsAuth.expires_in
    ? env.starwsAuth.expires_in / 60
    : 0; // exipires minutes at server
  const { renewTokenInMinute } = starwsConfig; // should renew token in minute
  const tokenGenerationTime = env.starwsAuth.token_generation_time; // last token generation

  // Check if should renew token using expires date from startws
  //      or from app config
  let expires = expiresIn - renewTokenInMinute;
  expires = expires > 0 ? renewTokenInMinute : expiresIn;

  const expiresDatetime = moment(tokenGenerationTime).add(expires, 'minutes');

  return moment().isAfter(expiresDatetime);
};

const authenticate = async () => {
  try {
    if (!isTokenExpired()) {
      return true;
    }

    const headers = {
      'content-type': 'application/x-www-form-urlencoded',
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    const response = await httpClient.post(
      starwsConfig.endpoints.auth,
      qs.stringify(starwsConfig.authParams),
      headers,
      starwsConfig.urlAuth,
    );

    if (response && response.data) {
      env.starwsAuth = response.data;
      env.starwsAuth.token_generation_time = moment();
      httpClient.addAccessToken(env.starwsAuth.access_token);
      logger.info(
        `Authentication successfully! ${env.starwsAuth.access_token}`,
      );
    } else {
      logger.info(`Something wrong.`);
      logger.info(response);
    }
    return true;
  } catch (err) {
    logger.error(`Authentication failure! msg: ${err}`);
    return false;
  }
};

authenticate();
setInterval(authenticate, 30000);

const publishMetrics = async (provider, node, data) => {
  let endPoint = starwsConfig.endpoints.publishMetrics;

  const route = new Route(endPoint);
  endPoint = route.reverse({ provider, node });

  try {
    const response = await httpClient.post(endPoint, data);
    logger.info(`POST Request for path /publish successfully executed!`);
    return response;
  } catch (e) {
    logger.error(`POST Request for path /publish failure! ${e}`);
    throw e;
  }
};

const metrics = async (provider, node, params) => {
  let endPoint = starwsConfig.endpoints.metrics;

  const route = new Route(endPoint);
  endPoint = route.reverse({ provider, node });

  try {
    const response = await httpClient.get({ path: endPoint, params });
    logger.info(`GET Request for path /metrics successfully executed!`);
    return response;
  } catch (e) {
    const msg = e && e.response ? e.response : e;
    logger.error(`GET Request for path /metrics failure!`);
    logger.error(msg);
    return msg;
  }
};

const saveJSONData = async (provider, node, data) => {
  const url = starwsConfig.urlFileData;
  let endPoint = starwsConfig.endpoints.jsonDataAPI;

  const route = new Route(endPoint);
  endPoint = route.reverse({ provider, node });

  try {
    const response = await httpClient.post(endPoint, data, {}, url);
    if (response.status === 200 && response.data) {
      logger.info(
        `POST Request to save JSON data in JSON-Data-API successfully!`,
      );
      return response.data;
    }
    logger.error(`POST Request to save JSON data in JSON-Data-API failure!`);
    return false;
  } catch (e) {
    const msg = e && e.response ? e.response : e;
    logger.error(`POST Request to save JSON data in JSON-Data-API failure!`);
    logger.error(msg);
    return msg;
  }
};

const getJSONData = async url => {
  try {
    const response = await httpClient.get({ path: url, isFullURL: true });
    if (response.status === 200 && response.data) {
      logger.info(
        `GET Request to get JSON data in JSON-Data-API successfully!`,
      );
      return response.data;
    }
    logger.error(`GET Request to get JSON data in JSON-Data-API failure!`);
    return false;
  } catch (e) {
    const msg = e && e.response ? e.response : e;
    logger.error(`GET Request to get JSON data in JSON-Data-API failure!`);
    logger.error(msg);
    return msg;
  }
};

const getThings = async params => {
  const endPoint = starwsConfig.endpoints.thing;

  try {
    const response = await httpClient.get({ path: endPoint, params });
    logger.info(`GET Request for path getThings successfully executed!`);
    if (response && response.data && response.data.code == 'OK') {
      return response.data.data;
    }

    throw new Error(response.data.error);
  } catch (e) {
    const msg = e && e.response ? e.response : e;
    logger.error(`GET Request for path getThings failure!`);
    logger.error(msg);
    return msg;
  }
};

module.exports = {
  publishMetrics,
  metrics,
  saveJSONData,
  getJSONData,
  getThings,
};
