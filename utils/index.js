const moment = require('moment');

const utils = (() => {
  return {
    dateFormat4StarWS: data => {
      if (!data) {
        return moment(0).format();
      }

      const theDate = moment(data);
      if (!theDate.isValid) {
        return moment(0).format();
      }

      return theDate.format();
    },

    dateFormat4Githunter: date => {
      const theDate = moment(date);
      if (!theDate.isValid())
        return date;
      
      if (theDate.year() <= 1970)
        return '';

      return date;
    },

    prepareString4StarWS: (data, shortStringLen = 250) => {
      if (!data) return data;
      return data.substring(0, shortStringLen);
    },

    prepareString4Githunter: (data) => {
      if (!data) return data;
      const regex = new RegExp('[a-z]{1}:');
      if (regex.test(data)){
        return data.substr(2, data.length);
      }

      return data;
    },

    concatArray4StarWS: (data, shortStringLen = 250) => {
      const str = data && Array.isArray(data) ? data.join(',') : '';
      if (!str) {
        return 'no-string';
      }
      return str.substring(0, shortStringLen);
    },
    nanoSeconds: () => {
      const hrTime = process.hrtime();
      const nTime = `${hrTime[0] * 1000000000}${hrTime[1]}`;
      const nSec = nTime.substr(nTime.length - 5);
      return moment().format(`YYYY-MM-DDTHH:mm:ss.SSS${nSec}Z`);
    },
  };
})();

module.exports = utils;
