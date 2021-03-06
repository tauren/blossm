const normalize = require("@blossm/normalize-cli");

const deploy = require("./deploy");
const init = require("./init");

module.exports = async args => {
  const input = await normalize({
    entrypointType: "action",
    choices: ["deploy", "init"],
    args
  });

  switch (input.action) {
    case "deploy":
      return deploy(input.args);
    case "init":
      return init(input.args);
  }
};
