const deployCliTemplate = require("@sustainers/deploy-cli-template");
const hash = require("@sustainers/hash-string");
const trim = require("@sustainers/trim-string");
const { MAX_LENGTH } = require("@sustainers/service-name-consts");

module.exports = deployCliTemplate({
  domain: "event-handler",
  dir: __dirname,
  configFn: config => {
    return {
      _ACTION: config.action,
      _NAME: config.name,
      _OPERATION_NAME: trim(
        `${config.service}-${config.context}-did-${config.action}-${config.name}`,
        MAX_LENGTH
      ),
      _OPERATION_HASH: hash(
        config.name +
          config.action +
          config.domain +
          config.context +
          config.service
      ).toString()
    };
  }
});