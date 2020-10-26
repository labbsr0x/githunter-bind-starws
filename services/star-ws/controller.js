const qs = require('qs');
const moment = require('moment');
const config = require('config');
const Route = require('route-parser');
const HttpClient = require('../rest/RESTClient');
const env = require('../../infra/env');

const starwsConfig = config.get('star-ws');
const httpClient = new HttpClient({
  url: starwsConfig.urlData,
});

// TODO: Use percentage of expires_in
const isTokenExpired = () => {
  // Fist time for authentication
  if (!env.starwsAuth) return true;

  const expiresIn = env.starwsAuth.expires_in; // exipires minutes at server
  const { renewTokenInMinute } = starwsConfig; // should renew token in minute
  const tokenGenerationTime = env.starwsAuth.token_generation_time; // last token generation

  // Check if should renew token using expires date from startws
  //      or from app config
  let expires = expiresIn - renewTokenInMinute;
  expires = expires > 0 ? renewTokenInMinute : expiresIn;

  const expiresDatetime = moment().add(expires, 'minutes');
  return tokenGenerationTime.isAfter(expiresDatetime);
};

const authenticate = async () => {
  try {
    if (!isTokenExpired()) {
      return true;
    }

    const headers = {
      'content-type': 'application/x-www-form-urlencoded',
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
    }
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const publishMetrics = async (provider, node, data) => {
  const isAuthenticate = await authenticate();
  if (!isAuthenticate) {
    console.log('error authenticating');
    return false;
  }
  let endPoint = starwsConfig.endpoints.publishMetrics;

  const route = new Route(endPoint);
  endPoint = route.reverse({ provider, node });

  try {
    const dateTimes = data.map(val => val.dateTime);
    const uniq = dateTimes
      .map(d => {
        return {
          count: 1,
          d: d,
        };
      })
      .reduce((a, b) => {
        a[b.d] = (a[b.d] || 0) + b.count;
        return a;
      }, {});

    const duplicates = Object.keys(uniq).filter(a => uniq[a] > 1);
    if (duplicates.length > 0) {
      const dup = data.filter(val => duplicates.includes(val.dateTime));
      console.log(dup);
    }
    console.log(duplicates);
    const response = await httpClient.post(endPoint, data);
    return response;
  } catch (e) {
    console.log(e);
    return e.response;
  }
};

const metrics = async (provider, node, params) => {
  const isAuthenticate = await authenticate();
  if (!isAuthenticate) {
    console.log('error authenticating');
    return false;
  }
  let endPoint = starwsConfig.endpoints.metrics;

  const route = new Route(endPoint);
  endPoint = route.reverse({ provider, node });

  try {
    const response = await httpClient.get({ path: endPoint, params });
    return response;
  } catch (e) {
    console.log(e);
    return e.response;
  }
};

const saveJSONData = async data => {
  const isAuthenticate = await authenticate();
  if (!isAuthenticate) {
    console.log('error authenticating');
    return false;
  }
  const endPoint = starwsConfig.endpoints.jsonDataAPI;
  try {
    const response = await httpClient.post(endPoint, data);
    if (response.status === 200 && response.data) {
      return response.data;
    }
    return false;
  } catch (e) {
    console.log(e);
    return e.response;
  }
};

const getJSONData = async url => {
  const isAuthenticate = await authenticate();
  if (!isAuthenticate) {
    console.log('error authenticating');
    return false;
  }

  try {
    const response = await httpClient.get({ path: url, isFullURL: true });
    if (response.status === 200 && response.data) {
      return response.data;
    }
    return false;
  } catch (e) {
    console.log(e);
    return e.response;
  }
};

module.exports = {
  publishMetrics,
  metrics,
  saveJSONData,
  getJSONData,
};
