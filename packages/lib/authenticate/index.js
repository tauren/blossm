const deps = require("./deps");

module.exports = async ({ req, verifyFn, requiresToken = true }) => {
  const tokens = deps.tokensFromReq(req);

  const jwt = tokens.bearer || tokens.cookie;

  if (jwt == undefined) {
    if (requiresToken) throw deps.invalidCredentialsError.tokenInvalid();
    return {};
  }

  const claims = await deps.validate({
    token: jwt,
    verifyFn
  });

  return claims;
};
