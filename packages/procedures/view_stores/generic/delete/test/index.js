const { expect } = require("chai").use(require("sinon-chai"));
const { restore, replace, fake } = require("sinon");

const del = require("..");
const deps = require("../deps");

const id = "some-id";
const deletedCount = 3;

describe("View store delete", () => {
  afterEach(() => {
    restore();
  });

  it("should call with the correct params", async () => {
    const removeFake = fake.returns({ deletedCount });

    const params = {
      id
    };
    const req = {
      params
    };

    const sendFake = fake();
    const res = {
      send: sendFake
    };

    await del({ removeFn: removeFake })(req, res);
    expect(removeFake).to.have.been.calledWith({
      id
    });
    expect(sendFake).to.have.been.calledWith({ deletedCount });
  });
  it("should throw if missing id params", async () => {
    const removeFake = fake.returns({ deletedCount });

    const params = {};
    const req = {
      params
    };

    const sendFake = fake();
    const res = {
      send: sendFake
    };

    const error = "some-error";
    const missingIdFake = fake.returns(error);
    replace(deps, "badRequestError", {
      missingId: missingIdFake
    });

    try {
      await del({ removeFn: removeFake })(req, res);

      //shouldn't get called
      expect(1).to.equal(0);
    } catch (e) {
      expect(e).to.equal(error);
    }
  });
});
