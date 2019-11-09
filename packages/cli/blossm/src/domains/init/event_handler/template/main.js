/**
 * This file is required.
 *
 * Specifies the event handler logic.
 *
 * The function takes in the event that it is subscribed to.
 * as well as the context param derived from the gateway.
 *
 */

/**
 * Add services that should be faked
 * in tests in the deps file.
 */
const deps = require("./deps");

module.exports = event => {
  const root = event.headers.root;
  const context = event.headers.context;

  deps
    .viewStore({
      name: "some-name",
      domain: "some-domain",
      service: process.env.SERVICE,
      network: process.env.NETWORK
    })
    .set({ context, tokenFn: deps.gcpToken })
    .update(root, {
      name: event.payload.name
    });
};