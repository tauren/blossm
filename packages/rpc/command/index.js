const { string: dateString } = require("@blossm/datetime");

const deps = require("./deps");

module.exports = ({ action, domain, service, network }) => {
  const issue = ({ context, session, tokenFn } = {}) => async (
    payload,
    { trace, source, issued, root, options } = {}
  ) => {
    const headers = {
      id: deps.uuid(),
      issued: issued || dateString(),
      ...(trace != undefined && { trace }),
      ...(source != undefined && { source })
    };

    const data = {
      payload,
      headers,
      ...(root && { root }),
      ...(options && { options })
    };
    return await deps
      .rpc(action, domain, "command-handler")
      .post(data)
      .in({
        ...(context && { context }),
        ...(session && { session }),
        ...(service && { service }),
        ...(network && { network })
      })
      .with({ tokenFn });
  };

  return {
    set: ({ context, session, tokenFn }) => {
      return {
        issue: issue({ context, session, tokenFn })
      };
    },
    issue: issue()
  };
};
