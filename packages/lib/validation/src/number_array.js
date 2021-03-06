const { Number: tNumber } = require("tcomb-validation");
const validator = require("./_validator");

module.exports = ({
  value,
  baseMessageFn,
  refinementFn,
  refinementMessageFn,
  title,
  path,
  optional
}) => {
  return validator({
    value,
    isArray: true,
    baseFn: tNumber,
    baseMessageFn,
    refinementMessageFn,
    refinementFn,
    title,
    path,
    optional
  });
};
