const deps = require("./deps");

module.exports = () => async (req, res) => {
  const response = await deps
    .viewStore({
      name: req.params.name,
      domain: req.params.domain
    })
    .set({ context: req.context, tokenFn: deps.gcpToken })
    .read(req.query);

  res.send(response);
};