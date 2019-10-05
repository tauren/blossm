const { expect } = require("chai").use(require("sinon-chai"));
const { restore, replace, fake } = require("sinon");

const get = require("..");
const deps = require("../deps");

const obj = "some-objs";
const found = { value: obj };
const root = "some-root";
const store = "some-store";

describe("Event store get", () => {
  afterEach(() => {
    restore();
  });
  it("should call with the correct params", async () => {
    const findOneFake = fake.returns(found);
    const db = {
      findOne: findOneFake
    };
    replace(deps, "db", db);
    const params = {
      root
    };
    const req = {
      params
    };
    const sendFake = fake();
    const res = {
      send: sendFake
    };
    await get({ store })(req, res);
    expect(findOneFake).to.have.been.calledWith({
      store,
      query: {
        "value.headers.root": root
      },
      options: {
        lean: true
      }
    });
    expect(sendFake).to.have.been.calledWith(obj);
  });
  it("should throw correctly if not found", async () => {
    const findOneFake = fake.returns(found);
    const db = {
      findOne: findOneFake
    };
    replace(deps, "db", db);
    const params = {
      root
    };
    const req = {
      params
    };
    const sendFake = fake();
    const res = {
      send: sendFake
    };
    expect(async () => await get({ store })(req, res)).to.throw;
  });
});