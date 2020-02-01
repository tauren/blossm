const deps = require("./deps");

const getEventsForPermissionsMerge = async ({
  principleRoot,
  session,
  aggregateFn
}) => {
  // Get the aggregates of the principle of the identity and the current principle of the session.
  const [
    { aggregate: principleAggregate },
    { aggregate: sessionPrincipleAggregate }
  ] = await Promise.all([
    aggregateFn(principleRoot, {
      domain: "principle"
    }),
    aggregateFn(session.sub, {
      domain: "principle"
    })
  ]);

  // Don't create an event if nothing is being saved.
  if (
    deps.difference(
      principleAggregate.permissions,
      sessionPrincipleAggregate.permissions
    ).length == 0
  )
    return { events: [], principleRoot };

  return {
    events: [
      {
        domain: "principle",
        action: "add-permissions",
        root: principleRoot,
        payload: {
          permissions: sessionPrincipleAggregate.permissions
        }
      }
    ],
    principleRoot
  };
};

const getEventsForIdentityRegistering = async ({ subject, payload }) => {
  // Create a new root.
  const [identityRoot, principleRoot, hashedPhone] = await Promise.all([
    deps.uuid(),
    subject || deps.uuid(),
    deps.hash(payload.phone)
  ]);

  return {
    events: [
      {
        action: "register",
        domain: "identity",
        root: identityRoot,
        payload: {
          phone: hashedPhone,
          principle: principleRoot
        }
      },
      {
        action: "principle",
        domain: "add-permissions",
        root: principleRoot,
        payload: {
          permissions: [`identity:admin:${identityRoot}`]
        }
      }
    ],
    principleRoot
  };
};

module.exports = async ({ payload, context, session, aggregateFn }) => {
  // Check to see if there is an identity with the provided phone.
  const [identity] = await deps
    .eventStore({
      domain: "identity"
    })
    .set({ context, tokenFn: deps.gcpToken })
    .query({ key: "phone", value: payload.phone });

  if (identity) {
    // Don't log an event or issue a challange if
    // the identity's root is already set as the session's subject.
    if (identity.state.principle == session.sub) return {};
  }

  // If an identity is found, merge the permissions given to the session's subject
  // to the identity's principle.
  // If not found, register a new identity and set the principle to be the session's subject.
  const { events, principleRoot } = identity
    ? await getEventsForPermissionsMerge({
        principleRoot: identity.state.principle,
        session,
        aggregateFn
      })
    : await getEventsForIdentityRegistering({
        subject: session.sub,
        payload
      });

  const { token } = await deps
    .command({
      action: "issue",
      domain: "challenge"
    })
    .set({
      context,
      tokenFn: deps.gcpToken,
      options: {
        principle: principleRoot,
        events
      }
    })
    .issue({
      phone: payload.phone
    });

  return { response: { token } };
};