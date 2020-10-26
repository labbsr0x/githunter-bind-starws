const moment = require('moment');
const logger = require('../config/logger');

const utils = (() => {
  return {
    dateCounter: 0,
    dateFormat4StarWS: data => {
      if (!data) {
        logger.debug(`UTILS dateFormat4StarWS: Date content is invalid!`);
        return moment(0).format();
      }

      const theDate = moment(data);
      if (!theDate.isValid) {
        logger.debug(
          `UTILS dateFormat4StarWS: Date format to StarWS is invalid!`,
        );
        return moment(0).format();
      }

      // Getting nano sec to avoid duplicate dateTime
      const hrTime = process.hrtime();
      const nTime = `${hrTime[0] * 1000000000}${hrTime[1]}`;
      const nSec = nTime.substr(nTime.length - 5);

      logger.debug(
        `UTILS dateFormat4StarWS: Formatted data to StarWS successfully!`,
      );
      return theDate.format(`YYYY-MM-DDTHH:mm:ss.SSS${nSec}Z`);
    },

    dateFormat4Githunter: date => {
      const theDate = moment(date);
      if (!theDate.isValid()) {
        logger.debug(
          `UTILS dateFormat4Githunter: Date format to Githunter is invalid!`,
        );
        return date;
      }

      if (theDate.year() <= 1970) {
        logger.debug(`UTILS dateFormat4Githunter: Date less than 1970!`);
        return '';
      }

      logger.debug(`UTILS dateFormat4Githunter: Date to Githunter is valid!`);
      return date;
    },

    prepareString4StarWS: (data, shortStringLen = 250) => {
      if (!data) {
        logger.debug(`UTILS prepareString4StarWS: String content is invalid!`);
        return data;
      }
      const d = data.substring(0, shortStringLen);
      logger.debug(`UTILS prepareString4StarWS: ${data} -> ${d}`);
      return d;
    },

    prepareString4Githunter: data => {
      if (!data) {
        logger.debug(`UTILS prepareString4StarWS: String content is invalid!`);
        return data;
      }

      const regex = new RegExp('[a-z]{1}:');
      if (regex.test(data)) {
        const d = data.substr(2, data.length);
        logger.debug(`UTILS prepareString4StarWS: ${data} -> ${d}`);
        return d;
      }

      logger.debug(
        `UTILS prepareString4StarWS: String trated to Githunter successfully!`,
      );
      return data;
    },

    concatArray4StarWS: (data, shortStringLen = 250) => {
      const str = data && Array.isArray(data) ? data.join(',') : '';
      if (!str) {
        logger.debug(
          `UTILS concatArray4StarWS: Array or array content is invalid!`,
        );
        return 'no-string';
      }
      logger.debug(
        `UTILS concatArray4StarWS: Array concatenated to StarWS successfully!`,
      );
      return str.substring(0, shortStringLen);
    },
    nanoSeconds: () => {
      const hrTime = process.hrtime();
      const nTime = `${hrTime[0] * 1000000000}${hrTime[1]}`;
      const nSec = nTime.substr(nTime.length - 5);

      logger.debug(`UTIL nanoSeconds: Nanosecond gerated successfully!`);
      return moment().format(`YYYY-MM-DDTHH:mm:ss.SSS${nSec}Z`);
    },
  };
})();

module.exports = utils;
