const defaultFn = query => {
  const querySort = query.sort;
  const queryParallel = query.parallel || 1;
  delete query.sort;
  delete query.context;
  delete query.parallel;
  return { query, sort: querySort, parallel: queryParallel };
};

module.exports = ({ streamFn, fn = defaultFn }) => {
  return async (req, res) => {
    const { query, sort, parallel } = fn(req.query);

    await streamFn({
      query,
      ...(sort && { sort }),
      parallel,
      fn: view => res.write(JSON.stringify(view))
    });

    res.end();
  };
};
