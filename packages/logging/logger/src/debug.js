const transports = require("@sustainer-network/log-transports");

module.exports = (message, metadata) => transports.debug(message, metadata);