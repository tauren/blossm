const { unauthorized } = require("@sustainers/errors");

module.exports = whitelist => {
  return {
    check: (origin, callback) => {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(unauthorized.cors);
      }
    }
  };
};