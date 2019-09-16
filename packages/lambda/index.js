require("localenv");

const logger = require("@sustainers/logger");

const deps = require("./deps");

module.exports = (fn, { path = "/", port = 3000 } = {}) => {
  const app = deps.express();

  const init = method => {
    deps.expressMiddleware(app);
    app.use((req, _, next) => {
      logger.info("Request: ", {
        params: req.params,
        body: req.body,
        query: req.query,
        headers: req.headers
      });
      next();
    });
    method(path, deps.asyncHandler(fn));
    app.use(deps.errorMiddleware);
    port = process.env.PORT || port;
    app.listen(port);
    logger.info("Listening...", { port });
    return app;
  };

  return {
    post: () => init(app.post),
    get: () => init(app.get)
  };
};
