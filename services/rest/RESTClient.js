const config = require('config');
const qs = require('qs');
const axios = require('axios').default;
const starwsConfig = config.get('star-ws');
const logger = require('../../config/logger');
class Http {
  constructor({ url, headers, accessToken }) {
    headers = headers || { 'Content-type': 'application/json' };

    if (!headers['Content-type']) {
      headers['Content-type'] = 'application/json';
    }

    this.service = axios.create({
      url,
      timeout: 120000,
      headers,
    });

    this.accessToken = '';
    if (accessToken) {
      this.accessToken = accessToken;
    }

    this.service.interceptors.request.use(config => {
      if (this.accessToken)
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      return config;
    });
  }

  addAccessToken(accessToken) {
    this.accessToken = accessToken;
  }

  get({ path, params, headers, isFullURL = false }) {
    let url = this.service.defaults.url + path;
    if (isFullURL) {
      url = path;
    }
    return this.service.get(url, {
      params,
      headers,
    });
  }

  patch(path, payload, callback) {
    return this.service
      .request({
        method: 'PATCH',
        url: this.service.defaults.url + path,
        responseType: 'json',
        data: payload,
      })
      .then(response => callback(response.status, response.data))
      .catch(err => {
        logger.error(err);
      });
  }

  post(path, payload, headers, url = null) {
    return this.service.request({
      method: 'POST',
      url: url ? url + path : this.service.defaults.url + path,
      headers,
      responseType: 'json',
      data: payload,
    });
  }
}

module.exports = Http;
