const deps = require("./deps");
const { notFound } = require("@sustainers/errors");

module.exports = ({ store, fn }) => {
  return async (req, res) => {
    const querySort = req.query && req.query.sort;
    delete req.query.sort;

    const { query, sort } = fn
      ? fn(req.query)
      : { query: req.query, sort: querySort };

    if (req.params.id == undefined) {
      const results = await deps.db.find({
        store,
        query: {
          ...query,
          ...(req.params.id && { id: req.params.id })
        },
        ...(sort && { sort }),
        options: {
          lean: true
        }
      });
      res.send(results);
    } else {
      const result = await deps.db.findOne({
        store,
        query: {
          ...(req.params.id && { id: req.params.id })
        },
        options: {
          lean: true
        }
      });

      if (!result) throw notFound.root;
      res.send(result);
    }
  };
};