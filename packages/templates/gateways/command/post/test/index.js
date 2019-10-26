const { expect } = require("chai").use(require("sinon-chai"));
const { restore, replace, fake } = require("sinon");

const deps = require("../deps");
const post = require("..");

const token = "some-token";
const payload = "some-payload";
const headers = "some-headers";
const body = "some-body";
const service = "some-service";
const network = "some-network";
const action = "some-action";
const domain = "some-domain";

process.env.SERVICE = service;
process.env.NETWORK = network;

describe("Command gateway post", () => {
  afterEach(() => {
    restore();
  });
  it("should call with the correct params when action and domain passed in url", async () => {
    const validateFake = fake();
    replace(deps, "validate", validateFake);

    const normalizeFake = fake.returns({ payload, headers });
    replace(deps, "normalize", normalizeFake);

    const issueFake = fake.returns({ token });
    const setFake = fake.returns({
      issue: issueFake
    });
    const commandFake = fake.returns({
      set: setFake
    });
    replace(deps, "command", commandFake);

    const req = {
      context,
      body,
      params: {
        action,
        domain
      }
    };

    const sendFake = fake();
    const statusFake = fake.returns({
      send: sendFake
    });
    const res = {
      status: statusFake
    };

    await post()(req, res);

    expect(validateFake).to.have.been.calledWith(body);
    expect(normalizeFake).to.have.been.calledWith(body);
    expect(commandFake).to.have.been.calledWith({
      action,
      domain,
      service,
      network
    });
    expect(setFake).to.have.been.calledWith({ tokenFn: deps.gcpToken });
    expect(issueFake).to.have.been.calledWith(payload, headers);
    expect(statusFake).to.have.been.calledWith(200);
    expect(sendFake).to.have.been.calledWith({
      token
    });
  });
  it("should call with the correct params when action and domain passed in url with args as well", async () => {
    const validateFake = fake();
    replace(deps, "validate", validateFake);

    const normalizeFake = fake.returns({ payload, headers });
    replace(deps, "normalize", normalizeFake);

    const issueFake = fake.returns({ token });
    const setFake = fake.returns({
      issue: issueFake
    });
    const commandFake = fake.returns({
      set: setFake
    });
    replace(deps, "command", commandFake);

    const req = {
      context,
      body,
      params: {
        action,
        domain
      }
    };

    const sendFake = fake();
    const statusFake = fake.returns({
      send: sendFake
    });
    const res = {
      status: statusFake
    };

    await post({ action: "some-bogus", domain: "some-other-bogus" })(req, res);

    expect(validateFake).to.have.been.calledWith(body);
    expect(normalizeFake).to.have.been.calledWith(body);
    expect(commandFake).to.have.been.calledWith({
      action,
      domain,
      service,
      network
    });
    expect(setFake).to.have.been.calledWith({ tokenFn: deps.gcpToken });
    expect(issueFake).to.have.been.calledWith(payload, headers);
    expect(statusFake).to.have.been.calledWith(200);
    expect(sendFake).to.have.been.calledWith({
      token
    });
  });
  it("should call with the correct params when action and domain passed in only args", async () => {
    const validateFake = fake();
    replace(deps, "validate", validateFake);

    const normalizeFake = fake.returns({ payload, headers });
    replace(deps, "normalize", normalizeFake);

    const issueFake = fake.returns({ token });
    const setFake = fake.returns({
      issue: issueFake
    });
    const commandFake = fake.returns({
      set: setFake
    });
    replace(deps, "command", commandFake);

    const req = {
      context,
      body,
      params: {}
    };

    const sendFake = fake();
    const statusFake = fake.returns({
      send: sendFake
    });
    const res = {
      status: statusFake
    };

    await post({ action, domain })(req, res);

    expect(validateFake).to.have.been.calledWith(body);
    expect(normalizeFake).to.have.been.calledWith(body);
    expect(commandFake).to.have.been.calledWith({
      action,
      domain,
      service,
      network
    });
    expect(setFake).to.have.been.calledWith({ tokenFn: deps.gcpToken });
    expect(issueFake).to.have.been.calledWith(payload, headers);
    expect(statusFake).to.have.been.calledWith(200);
    expect(sendFake).to.have.been.calledWith({
      token
    });
  });
  it("should throw correctly", async () => {
    const errorMessage = "error-message";
    const validateFake = fake.throws(new Error(errorMessage));
    replace(deps, "validate", validateFake);

    const req = {
      context,
      body
    };

    const sendFake = fake();
    const statusFake = fake.returns({
      send: sendFake
    });
    const res = {
      status: statusFake
    };

    try {
      await post({ action, domain })(req, res);
      //shouldn't be called
      expect(2).to.equal(1);
    } catch (e) {
      expect(e.message).to.equal(errorMessage);
    }
  });
});