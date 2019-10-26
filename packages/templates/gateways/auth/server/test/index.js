const { expect } = require("chai").use(require("sinon-chai"));
const { restore, replace, fake, stub, match } = require("sinon");
const authentication = require("@sustainers/authentication-middleware");

const deps = require("../deps");
const gateway = require("..");
const whitelist = "some-whitelist";
const scopesLookupFn = "some-lookup-fn";

describe("Auth gateway", () => {
  afterEach(() => {
    restore();
  });
  it("should call with the correct params", async () => {
    const corsMiddlewareFake = fake();
    replace(deps, "corsMiddleware", corsMiddlewareFake);

    const authorizationResult = "some-authorization";
    const authorizationFake = fake.returns(authorizationResult);
    replace(deps, "authorization", authorizationFake);

    const listenFake = fake();
    const secondPostFake = fake.returns({
      listen: listenFake
    });
    const postFake = fake.returns({
      post: secondPostFake
    });
    const serverFake = fake.returns({
      post: postFake
    });
    replace(deps, "server", serverFake);

    const gatewayIssueChallengeResult = "some-issue-challenge-result";
    const gatewayAnswerChallengeResult = "some-answer-challenge-result";
    const gatewayPostFake = stub();
    gatewayPostFake.onFirstCall().returns(gatewayIssueChallengeResult);
    gatewayPostFake.onSecondCall().returns(gatewayAnswerChallengeResult);
    replace(deps, "post", gatewayPostFake);

    await gateway({ whitelist, scopesLookupFn });

    expect(listenFake).to.have.been.calledWith();
    expect(serverFake).to.have.been.calledWith({
      prehook: match(fn => {
        const app = "some-app";
        fn(app);
        return corsMiddlewareFake.calledWith({
          app,
          whitelist,
          credentials: true,
          methods: ["POST"]
        });
      })
    });
    expect(secondPostFake).to.have.been.calledWith(
      gatewayAnswerChallengeResult,
      {
        path: "/challenge/answer",
        preMiddleware: [authentication, authorizationResult]
      }
    );
    expect(authorizationFake).to.have.been.calledWith({ scopesLookupFn });
    expect(postFake).to.have.been.calledWith(gatewayIssueChallengeResult, {
      path: "/challenge/issue"
    });
  });
  it("should throw correctly", async () => {
    const errorMessage = "error-message";
    const serverFake = fake.throws(new Error(errorMessage));
    replace(deps, "server", serverFake);
    try {
      await gateway({ whitelist, scopesLookupFn });
      //shouldn't be called
      expect(2).to.equal(1);
    } catch (e) {
      expect(e.message).to.equal(errorMessage);
    }
  });
});