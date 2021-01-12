const qs = require('qs');
const config = require('config');
const axios = require('axios').default;
const logger = require('../../config/logger');

const starwsConfig = config.get('star-ws');
class Http {
  constructor({ url, headers, accessToken }) {
    headers = headers || { 'Content-type': 'application/json' };

    if (!headers['Content-type']) {
      headers['Content-type'] = 'application/json';
    }

    this.service = axios.create({
      url,
      timeout: 30000,
      headers,
    });

    if (accessToken) {
      this.addAccessToken(accessToken);
    }
    let isRefreshing = false;
    let refreshSubscribers = [];
    function subscribeTokenRefresh(cb) {
      refreshSubscribers.push(cb);
    }

    function onRrefreshed(token) {
      refreshSubscribers.map(cb => cb(token));
    }
    this.service.interceptors.response.use((response) => {
      return response
    }, async (error) => {
      logger.error(`URL: ${error.config.url}`);
      const { config, response: { status } } = error;
      const originalRequest = config;

      if (status === 401) {
        if (!isRefreshing) {
          isRefreshing = true;
          this.getToken()
            .then(newToken => {
              isRefreshing = false;
              onRrefreshed(newToken);
              this.service.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
            });
        }

        const retryOrigReq = new Promise((resolve, reject) => {
          subscribeTokenRefresh(token => {
            // replace the expired token and retry
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            resolve(axios(originalRequest));
          });
        });
        return retryOrigReq;
      }
      return Promise.reject(error)
    }
    );
  }

  async getToken() {
    try {
      const headers = {
        'content-type': 'application/x-www-form-urlencoded',
      };
      const response = await this.post(
        starwsConfig.endpoints.auth,
        qs.stringify(starwsConfig.authParams),
        headers,
        starwsConfig.urlAuth,
      );
      if (response && response.data) {
        logger.info(
          `Successful authentication by HttpClient -> ${response.data.access_token}`,
        );
        return response.data.access_token;
      } else {
        logger.info(`Something wrong.`);
        logger.info(response);
      }
    } catch (err) {
      logger.error(`Authentication failure! msg: ${err}`);
      return false;
    }
  };

  addAccessToken(accessToken) {
    this.service.interceptors.request.use(config => {
      config.headers.common.Authorization = `Bearer ${accessToken}`;
      return config;
    });
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
