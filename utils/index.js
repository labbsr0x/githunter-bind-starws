const moment = require('moment');
const logger = require('../config/logger');

const utils = (() => {
  return {
    dateFormat4StarWS: data => {
      if (!data) {
        logger.debug(`UTILS Date content is invalid!`);
        return moment(0).format();
      }

      const theDate = moment(data);
      if (!theDate.isValid) {
        logger.debug(`UTILS Date format to StarWS is invalid!`);
        return moment(0).format();
      }

      logger.debug(`UTILS Formatted data to StarWS successfully!`);
      return theDate.format();
    },

    dateFormat4Githunter: date => {
      const theDate = moment(date);
      if (!theDate.isValid()) {
        logger.debug(`UTILS Date format to Githunter is invalid!`);
        return date;
      }

      if (theDate.year() <= 1970) {
        logger.debug(`UTILS Date less than 1970!`);
        return '';
      }

      logger.debug(`UTILS Date to Githunter is valid!`);
      return date;
    },

    prepareString4StarWS: (data, shortStringLen = 250) => {
      if (!data) {
        logger.debug(`UTILS String content is invalid!`);
        return data;
      }
      logger.debug(`UTILS String trated to StarWS successfully!`);
      return data.substring(0, shortStringLen);
    },

    prepareString4Githunter: (data) => {
      if (!data) {
        logger.debug(`UTILS String content is invalid!`);
        return data;
      }

      const regex = new RegExp('[a-z]{1}:');
      if (regex.test(data)){
        logger.debug(`UTILS String trated to Githunter successfully!`);
        return data.substr(2, data.length);
      }

      logger.debug(`UTILS String trated to Githunter successfully!`);
      return data;
    },

    concatArray4StarWS: (data, shortStringLen = 250) => {
      const str = data && Array.isArray(data) ? data.join(',') : '';
      if (!str) {
        logger.debug(`UTILS Array or array content is invalid!`);
        return 'no-string';
      }
      logger.debug(`UTILS Array concatenated to StarWS successfully!`);
      return str.substring(0, shortStringLen);
    },
    nanoSeconds: () => {
      const hrTime = process.hrtime();
      const nTime = `${hrTime[0] * 1000000000}${hrTime[1]}`;
      const nSec = nTime.substr(nTime.length - 5);

      logger.debug(`UTIL Nanosecond gerated successfully!`)
      return moment().format(`YYYY-MM-DDTHH:mm:ss.SSS${nSec}Z`);
    },
  };
})();

module.exports = utils;
