const { expect } = require("chai").use(require("sinon-chai"));
const { restore, fake, replace } = require("sinon");
const deps = require("../deps");
const gcpToken = require("..");

const hash = "some-operation-hash";

const gcpRegion = "some-region";
const name = "some-name";

process.env.GCP_REGION = gcpRegion;

describe("Gcp token", () => {
  afterEach(() => {
    restore();
  });
  it("should call correctly in staging", async () => {
    process.env.NODE_ENV = "staging";

    const body = "some-body";
    const response = {
      body
    };
    const getFake = fake.returns(response);
    replace(deps, "get", getFake);

    const result = await gcpToken({ hash, name });

    const url = `https://${gcpRegion}-${name}-${hash}-p3u6hkyfwa-uc.a.run.app`;

    expect(
      getFake
    ).to.have.been.calledWith(
      `http://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience=${url}`,
      { headers: { "Metadata-Flavor": "Google" } }
    );
    expect(result).to.equal(body);
  });
  it("should call correctly in sandbox", async () => {
    process.env.NODE_ENV = "sandbox";

    const body = "some-body";
    const response = {
      body
    };
    const getFake = fake.returns(response);
    replace(deps, "get", getFake);

    const result = await gcpToken({ hash, name });

    const url = `https://${gcpRegion}-${name}-${hash}-ixixyzl3ea-uc.a.run.app`;

    expect(
      getFake
    ).to.have.been.calledWith(
      `http://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience=${url}`,
      { headers: { "Metadata-Flavor": "Google" } }
    );
    expect(result).to.equal(body);
  });
  it("should call correctly in production", async () => {
    process.env.NODE_ENV = "production";

    const body = "some-body";
    const response = {
      body
    };
    const getFake = fake.returns(response);
    replace(deps, "get", getFake);

    const result = await gcpToken({ hash, name });

    const url = `https://${gcpRegion}-${name}-${hash}-qzhmgyrp2q-uc.a.run.app`;

    expect(
      getFake
    ).to.have.been.calledWith(
      `http://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience=${url}`,
      { headers: { "Metadata-Flavor": "Google" } }
    );
    expect(result).to.equal(body);
  });
  it("should call correctly in another environment", async () => {
    process.env.NODE_ENV = "local";

    const body = "some-body";
    const response = {
      body
    };
    const getFake = fake.returns(response);
    replace(deps, "get", getFake);

    const result = await gcpToken({ hash, name });
    expect(result).to.be.null;
  });
  it("should call correctly with error", async () => {
    process.env.NODE_ENV = "staging";

    const response = {
      statusCode: 300
    };
    const getFake = fake.returns(response);
    replace(deps, "get", getFake);

    const result = await gcpToken({ hash, name });

    const url = `https://${gcpRegion}-${name}-${hash}-p3u6hkyfwa-uc.a.run.app`;

    expect(
      getFake
    ).to.have.been.calledWith(
      `http://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience=${url}`,
      { headers: { "Metadata-Flavor": "Google" } }
    );
    expect(result).to.be.null;
  });
});
