const fs = require("fs-extra");
const yaml = require("yaml");
const path = require("path");
const rootDir = require("@blossm/cli-root-dir");

const viewStore = require("./view_store");
const commandGateway = require("./command_gateway");
const viewGateway = require("./view_gateway");
const commandHandler = require("./command_handler");
const eventHandler = require("./event_handler");
const eventStore = require("./event_store");
const job = require("./job");

const steps = ({
  region,
  domain,
  name,
  event,
  project,
  network,
  memory,
  envUriSpecifier,
  envNameSpecifier,
  containerRegistery,
  mainContainerName,
  dnsZone,
  service,
  context,
  env,
  operationHash,
  operationName,
  secretBucket,
  secretBucketKeyLocation,
  secretBucketKeyRing,
  imageExtension,
  runUnitTests,
  runBaseUnitTests,
  runIntegrationTests,
  runBaseIntegrationTests,
  actions,
  strict
}) => {
  const serviceName = `${region}-${operationName}-${operationHash}`;
  const uri = `${operationHash}.${region}.${envUriSpecifier}${network}`;
  const blossmConfig = rootDir.config();
  switch (context) {
    case "view-store":
      return viewStore({
        imageExtension,
        region,
        domain,
        name,
        event,
        project,
        network,
        memory,
        envUriSpecifier,
        envNameSpecifier,
        containerRegistery,
        mainContainerName,
        dnsZone,
        service,
        context,
        operationHash,
        operationName,
        serviceName,
        env,
        uri,
        secretBucket,
        secretBucketKeyLocation,
        secretBucketKeyRing,
        mongodbUser: blossmConfig.vendors.viewStore.mongodb.user,
        mongodbHost: blossmConfig.vendors.viewStore.mongodb.host,
        mongodbProtocol: blossmConfig.vendors.viewStore.mongodb.protocol,
        runUnitTests,
        runBaseUnitTests,
        runIntegrationTests,
        runBaseIntegrationTests,
        strict
      });
    case "event-store":
      return eventStore({
        imageExtension,
        domain,
        region,
        project,
        envNameSpecifier,
        dnsZone,
        service,
        context,
        network,
        envUriSpecifier,
        memory,
        env,
        serviceName,
        containerRegistery,
        mainContainerName,
        operationHash,
        uri,
        secretBucket,
        secretBucketKeyLocation,
        secretBucketKeyRing,
        mongodbUser: blossmConfig.vendors.eventStore.mongodb.user,
        mongodbHost: blossmConfig.vendors.eventStore.mongodb.host,
        mongodbProtocol: blossmConfig.vendors.eventStore.mongodb.protocol,
        runUnitTests,
        runBaseUnitTests,
        runIntegrationTests,
        runBaseIntegrationTests,
        actions,
        strict
      });
    case "event-handler":
    case "projection":
      return eventHandler({
        imageExtension,
        region,
        domain,
        name,
        event,
        project,
        network,
        envUriSpecifier,
        envNameSpecifier,
        containerRegistery,
        mainContainerName,
        dnsZone,
        service,
        memory,
        context,
        operationHash,
        env,
        serviceName,
        uri,
        secretBucket,
        secretBucketKeyLocation,
        secretBucketKeyRing,
        runUnitTests,
        runBaseUnitTests,
        runIntegrationTests,
        runBaseIntegrationTests,
        strict
      });
    case "command-handler":
      return commandHandler({
        imageExtension,
        name,
        region,
        domain,
        project,
        network,
        memory,
        mainContainerName,
        envUriSpecifier,
        envNameSpecifier,
        containerRegistery,
        operationHash,
        dnsZone,
        service,
        context,
        env,
        serviceName,
        uri,
        secretBucket,
        secretBucketKeyLocation,
        secretBucketKeyRing,
        runUnitTests,
        runBaseUnitTests,
        runIntegrationTests,
        runBaseIntegrationTests,
        strict
      });
    case "job":
      return job({
        imageExtension,
        name,
        domain,
        region,
        project,
        envNameSpecifier,
        envUriSpecifier,
        containerRegistery,
        mainContainerName,
        dnsZone,
        service,
        context,
        memory,
        operationHash,
        env,
        serviceName,
        uri,
        secretBucket,
        secretBucketKeyLocation,
        secretBucketKeyRing,
        runUnitTests,
        runBaseUnitTests,
        runIntegrationTests,
        runBaseIntegrationTests,
        strict
      });
    case "command-gateway":
      return commandGateway({
        imageExtension,
        region,
        project,
        envNameSpecifier,
        envUriSpecifier,
        containerRegistery,
        mainContainerName,
        dnsZone,
        memory,
        env,
        service,
        domain,
        context,
        network,
        operationHash,
        operationName,
        serviceName,
        secretBucket,
        secretBucketKeyLocation,
        secretBucketKeyRing,
        runUnitTests,
        runBaseUnitTests,
        runIntegrationTests,
        runBaseIntegrationTests,
        strict
      });
    case "view-gateway":
      return viewGateway({
        imageExtension,
        region,
        project,
        envNameSpecifier,
        envUriSpecifier,
        containerRegistery,
        mainContainerName,
        dnsZone,
        memory,
        env,
        service,
        domain,
        context,
        network,
        operationHash,
        operationName,
        serviceName,
        secretBucket,
        secretBucketKeyLocation,
        secretBucketKeyRing,
        runUnitTests,
        runBaseUnitTests,
        runIntegrationTests,
        runBaseIntegrationTests,
        strict
      });
  }
};

const imageExtension = ({ domain, name, event, context }) => {
  switch (context) {
    case "view-store":
      return `${domain}.${name}`;
    case "event-store":
    case "command-gateway":
    case "view-gateway":
      return domain;
    case "event-handler":
    case "projection":
      return `${domain}.${name}.did-${event.action}.${event.domain}`;
    case "command-handler":
    case "job":
      return `${domain}.${name}`;
  }
};

module.exports = ({
  workingDir,
  region,
  domain,
  event,
  name,
  project,
  network,
  context,
  memory,
  envUriSpecifier,
  envNameSpecifier,
  containerRegistery,
  mainContainerName,
  dnsZone,
  service,
  operationHash,
  operationName,
  env,
  uri,
  secretBucket,
  secretBucketKeyLocation,
  secretBucketKeyRing,
  actions,
  strict
}) => {
  const buildPath = path.resolve(workingDir, "build.yaml");

  const i = imageExtension({
    context,
    name,
    domain,
    event
  });

  const runUnitTests = fs.existsSync(path.resolve(workingDir, "test/unit"));
  const runBaseUnitTests = fs.existsSync(
    path.resolve(workingDir, "base_test/unit")
  );
  const runIntegrationTests = fs.existsSync(
    path.resolve(workingDir, "test/integration")
  );
  const runBaseIntegrationTests = fs.existsSync(
    path.resolve(workingDir, "base_test/integration")
  );

  const build = {
    steps: steps({
      imageExtension: i,
      region,
      domain,
      name,
      event,
      project,
      network,
      memory,
      context,
      envUriSpecifier,
      envNameSpecifier,
      containerRegistery,
      mainContainerName,
      dnsZone,
      service,
      env,
      operationHash,
      operationName,
      uri,
      secretBucket,
      secretBucketKeyLocation,
      secretBucketKeyRing,
      runUnitTests,
      runBaseUnitTests,
      runIntegrationTests,
      runBaseIntegrationTests,
      actions,
      strict
    })
  };

  fs.writeFileSync(buildPath, yaml.stringify(build));
};
