const gateway = require("@blossm/auth-gateway");
const { verify } = require("@blossm/gcp-kms");
const viewStore = require("@blossm/view-store-rpc");

const priviledges = require("./priviledges.js");
const scopes = require("./scopes.js");

const config = require("./config.json");

module.exports = gateway({
  whitelist: config.whitelist,
  scopesLookupFn: scopes,
  priviledgesLookupFn: priviledges,
  verifyFn: verify({
    ring: process.env.SERVICE,
    key: "challenge",
    location: "global",
    version: "1",
    project: process.env.GCP_PROJECT
  })
});

module.exports = gateway({
  commands: config.commands,
  whitelist: config.whitelist,
  permissionsLookupFn: principle =>
    viewStore({
      name: "permissions",
      domain: "principle"
    }).get({ principle }),
  verifyFn: verify({
    ring: process.env.SERVICE,
    key: "challenge",
    location: "global",
    version: "1",
    project: process.env.GCP_PROJECT
  })
});
