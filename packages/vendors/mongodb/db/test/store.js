const { expect } = require("chai").use(require("sinon-chai"));
const { restore, replace, replaceGetter, fake } = require("sinon");
const mongoose = require("mongoose");

const { store } = require("../index");

const protocol = "some-protocol";
const name = "collection";
const commonKey = "key";
const schema0 = {};
const schema0Value = "value0";
schema0[commonKey] = { type: String, default: schema0Value };

const schema1 = {};
const schema1Value = "value1";
schema1[commonKey] = { type: String, default: schema1Value };

const mixin0 = { schema: schema0 };
const mixin1 = { schema: schema1 };

const addFake = fake();
const schemaFake = fake.returns({
  add: addFake
});
const modelObject = "some-model-object";
const modelFake = fake.returns(modelObject);

const deps = require("../deps");

describe("Returns a model", () => {
  beforeEach(() => {
    replace(mongoose, "model", modelFake);
  });
  afterEach(() => {
    restore();
  });

  it("it should return a model object that is instatiatable", () => {
    replace(mongoose, "Schema", schemaFake);
    const mixins = [mixin0, mixin1];

    const result = store({ name, mixins });

    expect(result).to.equal(modelObject);
    expect(modelFake).to.have.been.calledWith(`${name}.0`);
    expect(addFake).to.have.been.calledWith({
      version: {
        type: Number,
        default: 0
      }
    });
    expect(schemaFake).to.have.been.calledWith(
      {},
      { strict: false, typePojoToMixed: false, minimize: false }
    );
    expect(addFake).to.have.been.calledWith({
      key: schema0[commonKey]
    });
    expect(addFake).to.have.been.calledWith({
      key: schema1[commonKey]
    });
  });

  it("it should apply the version to the model", () => {
    replace(mongoose, "Schema", schemaFake);
    const version = 2;

    const name = "collection";
    const mixins = [];

    const result = store({
      name,
      mixins,
      version
    });

    expect(result).to.equal(modelObject);
    expect(modelFake).to.have.been.calledWith(`${name}.2`);
  });

  it("it should apply mixins in the correct order", () => {
    const obj = {};
    const addFake = mixin => Object.assign(obj, mixin);
    const schemaFake = fake.returns({
      add: addFake
    });

    replace(mongoose, "Schema", schemaFake);

    const mixins = [mixin0, mixin1];

    store({
      name,
      mixins
    });

    expect(obj[commonKey].default).to.equal(schema1Value);
  });

  it("it should apply mixins in the correct order if a base is provided", () => {
    const obj = {};
    const addFake = mixin => Object.assign(obj, mixin);
    const schemaFake = fake.returns({
      add: addFake
    });

    replace(mongoose, "Schema", schemaFake);

    const mixins = [mixin1];

    store({
      name,
      schema: schema0,
      mixins
    });

    expect(obj[commonKey].default).to.equal(schema0Value);
    expect(schemaFake).to.have.been.calledWith(
      {},
      { strict: true, typePojoToMixed: false, minimize: false }
    );
  });
  it("it should connect if a connection string is passed in", () => {
    replace(mongoose, "Schema", schemaFake);
    const onFake = fake();
    const onceFake = fake();
    const connectFake = fake();
    const connectionFake = fake.returns({
      on: onFake,
      once: onceFake
    });
    replace(mongoose, "connect", connectFake);
    replaceGetter(mongoose, "connection", connectionFake);
    const name = "collection";

    const mixins = [mixin0, mixin1];

    const user = "user";
    const password = "pass";
    const host = "host";
    const database = "db";

    const result = store({
      name,
      mixins,
      connection: {
        protocol,
        user,
        password,
        host,
        database
      }
    });

    expect(result).to.equal(modelObject);

    const baseConnectionString = `${protocol}://${user}:${password}@${host}/${database}`;

    expect(connectFake).to.have.been.calledWith(baseConnectionString, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      autoIndex: false,
      poolSize: 10
    });
  });
  it("it should throw if it doesnt have a name", () => {
    replace(mongoose, "Schema", schemaFake);
    const mixin1 = { viewMethods: { x: () => 0 } };
    const mixin2 = { viewMethods: { y: () => 0 } };

    const mixins = [mixin1, mixin2];

    const error = "some-error";
    const internalServerMessageErrorFake = fake.returns(error);
    replace(deps, "internalServerError", {
      message: internalServerMessageErrorFake
    });

    try {
      store({ mixins });

      //shouldn't get called
      expect(1).to.equal(0);
    } catch (e) {
      expect(internalServerMessageErrorFake).to.have.been.calledWith(
        "View store needs a name."
      );
      expect(e).to.equal(error);
    }
  });
});
