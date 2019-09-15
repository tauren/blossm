const { expect } = require("chai").use(require("sinon-chai"));
const { restore, fake } = require("sinon");

const authorize = require("..");

const service = "some-service";
const network = "some-network";
const domain = "some-domain";
const root = "some-root";
const priviledges = ["some-priviledges"];
const path = "some-path";

const priviledgesLookupFn = fake.returns(priviledges);
const joinedPriviledges = priviledges.join(",");

const principle = "some-priciple-root";

const context = {
  network,
  service,
  any: "any-root"
};

const claims = {
  context,
  principle
};

describe("Authorize", () => {
  beforeEach(() => {
    process.env.SERVICE = service;
    process.env.NETWORK = network;
  });
  afterEach(() => {
    restore();
  });
  it("should authorize all wildcards", async () => {
    const scopes = ["*:*:*"];

    const scopesLookupFn = fake.returns(scopes);

    const document = await authorize({
      path,
      claims,
      scopesLookupFn,
      priviledgesLookupFn,
      root,
      domain
    });

    expect(priviledgesLookupFn).to.have.been.calledWith({ path });
    expect(scopesLookupFn).to.have.been.calledWith({ principle });
    expect(document).to.deep.equal({
      context: {
        ...context,
        scopes,
        principle
      }
    });
  });
  it("should authorize with no domain", async () => {
    const scopes = [`bogus:${joinedPriviledges}:${root}`];

    const scopesLookupFn = fake.returns(scopes);

    const document = await authorize({
      path,
      claims,
      scopesLookupFn,
      priviledgesLookupFn,
      root
    });

    expect(priviledgesLookupFn).to.have.been.calledWith({ path });
    expect(scopesLookupFn).to.have.been.calledWith({ principle });
    expect(document).to.deep.equal({
      context: {
        ...context,
        scopes,
        principle
      }
    });
  });
  it("should authorize with matching scope", async () => {
    const scopes = [`${domain}:${joinedPriviledges}:${root}`];

    const scopesLookupFn = fake.returns(scopes);

    const document = await authorize({
      path,
      claims,
      scopesLookupFn,
      priviledgesLookupFn,
      root,
      domain
    });

    expect(priviledgesLookupFn).to.have.been.calledWith({ path });
    expect(scopesLookupFn).to.have.been.calledWith({ principle });
    expect(document).to.deep.equal({
      context: {
        ...context,
        scopes,
        principle
      }
    });
  });
  it("should authorize with multiple matching scopes", async () => {
    const scopes = [
      `${domain}:${joinedPriviledges}:${root}`,
      `*:${joinedPriviledges}:${root}`,
      `${domain}:*:${root}`,
      `${domain}:${joinedPriviledges}:*`,
      `${domain}:${joinedPriviledges}`,
      `${domain},some-other:*:${root}`,
      `${domain}:${joinedPriviledges},some-other,${joinedPriviledges}:*`,
      `${domain},some-other:${joinedPriviledges}:*`,
      `${domain},some-other:${joinedPriviledges}`
    ];

    const scopesLookupFn = fake.returns(scopes);

    const document = await authorize({
      path,
      claims,
      scopesLookupFn,
      priviledgesLookupFn,
      root,
      domain
    });

    expect(priviledgesLookupFn).to.have.been.calledWith({ path });
    expect(scopesLookupFn).to.have.been.calledWith({ principle });
    expect(document).to.deep.equal({
      context: {
        ...context,
        scopes,
        principle
      }
    });
  });
  it("should authorize without priviledges", async () => {
    const scopes = ["*:bogus:*"];

    const scopesLookupFn = fake.returns(scopes);

    const document = await authorize({
      path,
      claims,
      scopesLookupFn,
      root,
      domain
    });

    expect(priviledgesLookupFn).to.have.been.calledWith({ path });
    expect(scopesLookupFn).to.have.been.calledWith({ principle });
    expect(document).to.deep.equal({
      context: {
        ...context,
        scopes,
        principle
      }
    });
  });
  it("should not authorize if theres a mismatch in priviledges", async () => {
    const scopes = [`${domain}:bogus:${root}`];

    const scopesLookupFn = fake.returns(scopes);

    expect(
      async () =>
        await authorize({
          path,
          claims,
          scopesLookupFn,
          root,
          domain
        })
    ).to.throw;
  });
  it("should not authorize if theres a mismatch in root", async () => {
    const scopes = [`${domain}:${joinedPriviledges}:bogus`];

    const scopesLookupFn = fake.returns(scopes);

    expect(
      async () =>
        await authorize({
          path,
          claims,
          scopesLookupFn,
          root,
          domain
        })
    ).to.throw;
  });
  it("should not authorize if theres a mismatch in domain", async () => {
    const scopes = [`bogus:${joinedPriviledges}:${root}`];
    const scopesLookupFn = fake.returns(scopes);

    expect(
      async () =>
        await authorize({
          path,
          claims,
          scopesLookupFn,
          root,
          domain
        })
    ).to.throw;
  });
  it("should not authorize if theres a mismatch in service", async () => {
    const scopes = [`${domain}:${joinedPriviledges}:${root}`];
    const scopesLookupFn = fake.returns(scopes);

    process.env.SERVICE = "bogus";

    expect(
      async () =>
        await authorize({
          path,
          claims,
          scopesLookupFn,
          root,
          domain
        })
    ).to.throw;
  });
  it("should not authorize if theres a mismatch in network", async () => {
    const scopes = [`${domain}:${joinedPriviledges}:${root}`];
    const scopesLookupFn = fake.returns(scopes);

    process.env.NETWORK = "bogus";

    expect(
      async () =>
        await authorize({
          path,
          claims,
          scopesLookupFn,
          root,
          domain
        })
    ).to.throw;
  });
  it("should not authorize if there is no token", async () => {
    const scopes = [`${domain}:${joinedPriviledges}:${root}`];
    const scopesLookupFn = fake.returns(scopes);

    expect(
      async () =>
        await authorize({
          path,
          claims,
          scopesLookupFn,
          root,
          domain
        })
    ).to.throw;
  });
});