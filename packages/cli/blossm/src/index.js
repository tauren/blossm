const normalize = require("@blossm/normalize-cli");
const roboSay = require("@blossm/robo-say");
const fs = require("fs");
const yaml = require("yaml");
const path = require("path");
const { red } = require("chalk");

const config = require("./config");
const init = require("./init");
const set = require("./set");
const secret = require("./secret");
const commandHandler = require("./command_handler");
const eventHandler = require("./event_handler");
const projection = require("./projection");
const eventStore = require("./event_store");
const viewStore = require("./view_store");
const commandGateway = require("./command_gateway");
const viewGateway = require("./view_gateway");
const job = require("./job");

const domains = [
  "begin",
  "config",
  "init",
  "set",
  "command-handler",
  "event-handler",
  "projection",
  "view-store",
  "event-store",
  "command-gateway",
  "view-gateway",
  "job"
];

const tryShortcuts = input => {
  const inputPath =
    input.positionalArgs.length >
    input.args.filter(a => a.startsWith("-")).length
      ? input.positionalArgs[0]
      : ".";
  const configPath = path.resolve(process.cwd(), inputPath, "blossm.yaml");
  const config = yaml.parse(fs.readFileSync(configPath, "utf8"));

  if (!config.context) throw "Context not set.";

  const args = [];

  if (input.domain == "test") {
    args.push("deploy");
    args.push("--test-only");
  } else {
    args.push(input.domain);
  }
  args.push(...input.args);

  switch (config.context) {
    case "command-handler":
      return commandHandler(args);
    case "event-handler":
      return eventHandler(args);
    case "projection":
      return projection(args);
    case "event-store":
      return eventStore(args);
    case "view-store":
      return viewStore(args);
    case "command-gateway":
      return commandGateway(args);
    case "view-gateway":
      return viewGateway(args);
    case "job":
      return job(args);
  }
};

const forward = input => {
  switch (input.domain) {
    case "init":
      return init(input.args);
    case "config":
      return config(input.args);
    case "secret":
      return secret(input.args);
    case "set":
      return set(input.args);
    case "command-handler":
      return commandHandler(input.args);
    case "event-handler":
      return eventHandler(input.args);
    case "projection":
      return projection(input.args);
    case "event-store":
      return eventStore(input.args);
    case "view-store":
      return viewStore(input.args);
    case "command-gateway":
      return commandGateway(input.args);
    case "view-gateway":
      return viewGateway(input.args);
    case "job":
      return job(input.args);
    default: {
      try {
        tryShortcuts(input);
      } catch (e) {
        //eslint-disable-next-line no-console
        console.error(
          roboSay(
            `This domain isn't recognized. Choose from one of these [${domains.join(
              ", "
            )}], or from one of these shortcuts [deploy, test]`
          ),
          red.bold("error")
        );
      }
    }
  }
};

exports.cli = async rawArgs => {
  const input = await normalize({
    entrypointType: "domain",
    args: rawArgs.slice(2)
  });

  forward(input);
};
