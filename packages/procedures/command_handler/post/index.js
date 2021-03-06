const deps = require("./deps");

module.exports = ({
  mainFn,
  validateFn,
  normalizeFn,
  fillFn,
  aggregateFn,
  addFn
}) => {
  return async (req, res) => {
    if (validateFn) await validateFn(req.body.payload);
    if (fillFn) req.body.payload = await fillFn(req.body.payload);
    if (normalizeFn) req.body.payload = await normalizeFn(req.body.payload);

    const { events = [], response } = await mainFn({
      payload: req.body.payload,
      ...(req.body.root && { root: req.body.root }),
      ...(req.body.options && { options: req.body.options }),
      session: req.body.session,
      context: req.body.context,
      aggregateFn: aggregateFn({
        context: req.body.context,
        session: req.body.session
      })
    });

    const synchronousFns = [];
    let asynchronousFns = [];
    for (const {
      root,
      payload = {},
      correctNumber,
      async = true,
      version = 0,
      action,
      domain = process.env.DOMAIN
    } of events) {
      const fn = async () => {
        const event = await deps.createEvent({
          ...(root && { root }),
          payload,
          trace: req.body.headers.trace,
          version,
          action,
          domain,
          service: process.env.SERVICE,
          idempotency: req.body.headers.idempotency,
          command: {
            id: req.body.headers.id,
            issued: req.body.headers.issued,
            name: process.env.NAME,
            domain: process.env.DOMAIN,
            service: process.env.SERVICE,
            network: process.env.NETWORK
          }
        });

        await addFn({
          domain,
          context: req.body.context,
          session: req.body.session,
          event,
          ...(correctNumber && { number: correctNumber })
        });
      };

      if (async) {
        asynchronousFns.push(fn);
      } else {
        synchronousFns.push(
          async () => await Promise.all(asynchronousFns.map(f => f()))
        );
        synchronousFns.push(fn);
        asynchronousFns = [];
      }
    }

    for (const fn of [
      ...synchronousFns,
      ...(asynchronousFns.length > 0
        ? [async () => await Promise.all(asynchronousFns.map(f => f()))]
        : [])
    ]) {
      await fn();
    }

    res.status(response ? 200 : 204).send(response);
  };
};
