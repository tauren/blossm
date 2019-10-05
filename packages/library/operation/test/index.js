const { expect } = require("chai")
  .use(require("chai-datetime"))
  .use(require("sinon-chai"));
const { restore, replace, fake, useFakeTimers } = require("sinon");
const operation = require("..");
const request = require("@sustainers/request");

let clock;

const now = new Date();

const data = { a: 1, context: 3 };
const context = { b: 4 };
const op = "some.operation";
const token = "some-token";
const root = "some-root";

const network = "some-network";
const service = "some-service";
const statusCode = 204;
const response = {
  statusCode
};
const body = {
  some: "body"
};
const bodyResponse = {
  body: JSON.stringify(body),
  statusCode: 200
};

describe("Operation", () => {
  beforeEach(() => {
    clock = useFakeTimers(now.getTime());
  });
  afterEach(() => {
    clock.restore();
    restore();
  });

  it("should call post with the correct params", async () => {
    const post = fake.returns(response);
    replace(request, "post", post);

    const tokenFnFake = fake.returns(token);
    const result = await operation(op)
      .post(data)
      .in({ context, service, network })
      .with({ tokenFn: tokenFnFake });

    expect(post).to.have.been.calledWith(
      `http://${op}.${service}.${network}`,
      {
        ...data,
        context
      },
      {
        Authorization: `Bearer ${token}`
      }
    );
    expect(tokenFnFake).to.have.been.calledWith({
      operation: op
    });
    expect(result).to.be.null;
  });
  it("should call post with the correct params with no token", async () => {
    const post = fake.returns(response);
    replace(request, "post", post);

    const result = await operation(op)
      .post(data)
      .in({ context, service, network })
      .with();

    expect(post).to.have.been.calledWith(`http://${op}.${service}.${network}`, {
      ...data,
      context
    });
    expect(result).to.be.null;
  });

  it("should call post with the correct params with no token", async () => {
    const post = fake.returns(response);
    replace(request, "post", post);

    const emptyTokenFake = fake();
    const result = await operation(op)
      .post(data)
      .in({ context, service, network })
      .with({ tokenFn: emptyTokenFake });

    expect(post).to.have.been.calledWith(`http://${op}.${service}.${network}`, {
      ...data,
      context
    });
    expect(emptyTokenFake).to.have.been.calledWith({
      operation: op
    });
    expect(result).to.be.null;
  });

  it("should call post with the correct params with path", async () => {
    const post = fake.returns(response);
    replace(request, "post", post);

    const tokenFnFake = fake.returns(token);
    const path = "/some/path";
    const result = await operation(op)
      .post(data)
      .in({ context, service, network })
      .with({ path, tokenFn: tokenFnFake });

    expect(post).to.have.been.calledWith(
      `http://${op}.${service}.${network}${path}`,
      {
        ...data,
        context
      },
      {
        Authorization: `Bearer ${token}`
      }
    );
    expect(tokenFnFake).to.have.been.calledWith({
      operation: op
    });
    expect(result).to.be.null;
  });

  it("should call get with the correct params", async () => {
    const get = fake.returns(bodyResponse);
    replace(request, "get", get);

    const tokenFnFake = fake.returns(token);
    const result = await operation(op)
      .get(data)
      .in({ context, service, network })
      .with({ tokenFn: tokenFnFake });

    expect(get).to.have.been.calledWith(
      `http://${op}.${service}.${network}`,
      {
        ...data,
        context
      },
      {
        Authorization: `Bearer ${token}`
      }
    );
    expect(tokenFnFake).to.have.been.calledWith({
      operation: op
    });
    expect(result).to.deep.equal(body);
  });
  it("should call get with the correct params with root", async () => {
    const get = fake.returns(bodyResponse);
    replace(request, "get", get);

    const tokenFnFake = fake.returns(token);
    const result = await operation(op)
      .get({ ...data, root })
      .in({ context, service, network })
      .with({ tokenFn: tokenFnFake });

    expect(get).to.have.been.calledWith(
      `http://${op}.${service}.${network}/${root}`,
      {
        ...data,
        context
      },
      {
        Authorization: `Bearer ${token}`
      }
    );
    expect(tokenFnFake).to.have.been.calledWith({
      operation: op
    });
    expect(result).to.deep.equal(body);
  });
  it("should call put with the correct params", async () => {
    const put = fake.returns(response);
    replace(request, "put", put);

    const tokenFnFake = fake.returns(token);
    const result = await operation(op)
      .put(root, data)
      .in({ context, service, network })
      .with({ tokenFn: tokenFnFake });

    expect(put).to.have.been.calledWith(
      `http://${op}.${service}.${network}/${root}`,
      {
        ...data,
        context
      },
      {
        Authorization: `Bearer ${token}`
      }
    );
    expect(tokenFnFake).to.have.been.calledWith({
      operation: op
    });
    expect(result).to.be.null;
  });
  it("should call put with the correct params with path", async () => {
    const put = fake.returns(response);
    replace(request, "put", put);

    const tokenFnFake = fake.returns(token);
    const path = "/some/path";
    const result = await operation(op)
      .put(root, data)
      .in({ context, service, network })
      .with({ path, tokenFn: tokenFnFake });

    expect(put).to.have.been.calledWith(
      `http://${op}.${service}.${network}${path}/${root}`,
      {
        ...data,
        context
      },
      {
        Authorization: `Bearer ${token}`
      }
    );
    expect(tokenFnFake).to.have.been.calledWith({
      operation: op
    });
    expect(result).to.be.null;
  });
  it("should call delete with the correct params", async () => {
    const del = fake.returns(response);
    replace(request, "delete", del);

    const tokenFnFake = fake.returns(token);
    const result = await operation(op)
      .delete(root)
      .in({ context, service, network })
      .with({ tokenFn: tokenFnFake });

    expect(del).to.have.been.calledWith(
      `http://${op}.${service}.${network}/${root}`,
      {
        context
      },
      {
        Authorization: `Bearer ${token}`
      }
    );
    expect(tokenFnFake).to.have.been.calledWith({
      operation: op
    });
    expect(result).to.be.null;
  });
  it("should return error correctly", async () => {
    const errorStatusCode = 400;
    const statusMessage = "some-status-message";
    const errorMessage = "some-error-message";
    const errBody = { message: errorMessage };
    const del = fake.returns({
      statusCode: errorStatusCode,
      statusMessage,
      body: JSON.stringify(errBody)
    });
    replace(request, "delete", del);

    const tokenFnFake = fake.returns(token);
    try {
      await operation(op)
        .delete(root)
        .in({ context, service, network })
        .with({ tokenFn: tokenFnFake });

      expect(3).to.equal(4);
    } catch (e) {
      expect(e.message).to.equal(errorMessage);
      expect(e.body.code).to.equal("BadRequest");
      expect(e).to.exist;
    }
  });
  it("should return error correctly without message", async () => {
    const errorStatusCode = 400;
    const statusMessage = "some-status-message";
    const errBody = { some: "err" };
    const del = fake.returns({
      statusCode: errorStatusCode,
      statusMessage,
      body: JSON.stringify(errBody)
    });
    replace(request, "delete", del);

    const tokenFnFake = fake.returns(token);
    try {
      await operation(op)
        .delete(root)
        .in({ context, service, network })
        .with({ tokenFn: tokenFnFake });

      expect(3).to.equal(4);
    } catch (e) {
      expect(e.message).to.equal("Not specified");
      expect(e.body.code).to.equal("BadRequest");
      expect(e).to.exist;
    }
  });
  it("should throw correctly", async () => {
    const errorStatusCode = 400;
    const statusMessage = "some-status-message";
    const errBody = { some: "err" };
    const del = fake.rejects({
      statusCode: errorStatusCode,
      statusMessage,
      body: JSON.stringify(errBody)
    });
    replace(request, "delete", del);

    const tokenFnFake = fake.returns(token);
    try {
      await operation(op)
        .delete(root)
        .in({ context, service, network })
        .with({ tokenFn: tokenFnFake });

      //shouldnt be called
      expect(3).to.equal(4);
    } catch (e) {
      expect(e).to.exist;
    }
  });
});