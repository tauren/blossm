const deps = require("./deps");

const defaultFn = body => body;

module.exports = ({ writeFn, dataFn = defaultFn }) => {
  return async (req, res) => {
    const id = deps.uuid();

    const now = deps.dateString();

    const customData = dataFn(req.body);

    const data = {
      ...customData,
      id,
      modified: now,
      created: now
    };

    await writeFn({
      id,
      data
    });

    res.status(204).send();
  };
};
