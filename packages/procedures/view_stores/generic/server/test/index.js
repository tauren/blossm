const { expect } = require("chai").use(require("sinon-chai"));
const { restore, replace, fake } = require("sinon");

const deps = require("../deps");

describe("View store", () => {
  beforeEach(() => {
    delete require.cache[require.resolve("..")];
    process.env.NODE_ENV = "some-env";
  });
  afterEach(() => {
    restore();
  });

  it("should call with the correct params", async () => {
    const viewStore = require("..");

    const listenFake = fake();
    const deleteFake = fake.returns({
      listen: listenFake
    });
    const putFake = fake.returns({
      delete: deleteFake
    });
    const postFake = fake.returns({
      put: putFake
    });
    const secondGetFake = fake.returns({
      post: postFake
    });
    const firstGetFake = fake.returns({
      get: secondGetFake
    });
    const serverFake = fake.returns({
      get: firstGetFake
    });
    replace(deps, "server", serverFake);

    const viewStoreGetResult = "some-get-result";
    const viewStoreGetFake = fake.returns(viewStoreGetResult);
    replace(deps, "get", viewStoreGetFake);

    const viewStoreStreamResult = "some-stream-result";
    const viewStoreStreamFake = fake.returns(viewStoreStreamResult);
    replace(deps, "stream", viewStoreStreamFake);

    const viewStorePostResult = "some-post-result";
    const viewStorePostFake = fake.returns(viewStorePostResult);
    replace(deps, "post", viewStorePostFake);

    const viewStorePutResult = "some-put-result";
    const viewStorePutFake = fake.returns(viewStorePutResult);
    replace(deps, "put", viewStorePutFake);

    const viewStoreDeleteResult = "some-delete-result";
    const viewStoreDeleteFake = fake.returns(viewStoreDeleteResult);
    replace(deps, "delete", viewStoreDeleteFake);

    const streamFn = "some-stream-fn";
    const findFn = "some-find-fn";
    const findOneFn = "some-find-one-fn";
    const writeFn = "some-write-fn";
    const removeFn = "some-remove-fn";
    const queryFn = "some-query-fn";
    const dataFn = "some-data-fn";

    await viewStore({
      streamFn,
      findFn,
      findOneFn,
      writeFn,
      removeFn,
      queryFn,
      dataFn
    });

    expect(listenFake).to.have.been.calledOnce;
    expect(serverFake).to.have.been.calledOnce;
    expect(secondGetFake).to.have.been.calledWith(viewStoreGetResult);
    expect(firstGetFake).to.have.been.calledWith(viewStoreStreamResult);
    expect(postFake).to.have.been.calledWith(viewStorePostResult);
    expect(putFake).to.have.been.calledWith(viewStorePutResult);
    expect(deleteFake).to.have.been.calledWith(viewStoreDeleteResult);
    expect(viewStoreStreamFake).to.have.been.calledWith({
      streamFn,
      queryFn
    });
    expect(viewStoreGetFake).to.have.been.calledWith({
      findFn,
      findOneFn,
      queryFn
    });
    expect(viewStorePostFake).to.have.been.calledWith({
      writeFn,
      dataFn
    });
    expect(viewStorePutFake).to.have.been.calledWith({
      writeFn,
      dataFn
    });
    expect(viewStoreDeleteFake).to.have.been.calledWith({ removeFn });
  });
  it("should call with the correct params with optionals missing", async () => {
    const viewStore = require("..");

    const listenFake = fake();
    const deleteFake = fake.returns({
      listen: listenFake
    });
    const putFake = fake.returns({
      delete: deleteFake
    });
    const postFake = fake.returns({
      put: putFake
    });
    const secondGetFake = fake.returns({
      post: postFake
    });
    const firstGetFake = fake.returns({
      get: secondGetFake
    });
    const serverFake = fake.returns({
      get: firstGetFake
    });
    replace(deps, "server", serverFake);

    const viewStoreGetResult = "some-get-result";
    const viewStoreGetFake = fake.returns(viewStoreGetResult);
    replace(deps, "get", viewStoreGetFake);

    const viewStoreStreamResult = "some-stream-result";
    const viewStoreStreamFake = fake.returns(viewStoreStreamResult);
    replace(deps, "stream", viewStoreStreamFake);

    const viewStorePostResult = "some-post-result";
    const viewStorePostFake = fake.returns(viewStorePostResult);
    replace(deps, "post", viewStorePostFake);

    const viewStorePutResult = "some-put-result";
    const viewStorePutFake = fake.returns(viewStorePutResult);
    replace(deps, "put", viewStorePutFake);

    const viewStoreDeleteResult = "some-delete-result";
    const viewStoreDeleteFake = fake.returns(viewStoreDeleteResult);
    replace(deps, "delete", viewStoreDeleteFake);

    const streamFn = "some-stream-fn";
    const findFn = "some-find-fn";
    const findOneFn = "some-find-one-fn";
    const writeFn = "some-write-fn";
    const removeFn = "some-remove-fn";

    await viewStore({
      streamFn,
      findFn,
      findOneFn,
      writeFn,
      removeFn
    });

    expect(listenFake).to.have.been.calledOnce;
    expect(serverFake).to.have.been.calledOnce;
    expect(secondGetFake).to.have.been.calledWith(viewStoreGetResult);
    expect(firstGetFake).to.have.been.calledWith(viewStoreStreamResult);
    expect(postFake).to.have.been.calledWith(viewStorePostResult);
    expect(putFake).to.have.been.calledWith(viewStorePutResult);
    expect(deleteFake).to.have.been.calledWith(viewStoreDeleteResult);
    expect(viewStoreStreamFake).to.have.been.calledWith({ streamFn });
    expect(viewStoreGetFake).to.have.been.calledWith({ findFn, findOneFn });
    expect(viewStorePostFake).to.have.been.calledWith({ writeFn });
    expect(viewStorePutFake).to.have.been.calledWith({ writeFn });
    expect(viewStoreDeleteFake).to.have.been.calledWith({ removeFn });
  });
});
