const { object, string, date, findError } = require("@blossm/validator");
const { SECONDS_IN_DAY } = require("@blossm/duration-consts");

const deps = require("./deps");

module.exports = async params => {
  const error = findError([
    object(params.headers, { title: "headers", path: "headers" }),
    object(params.payload, {
      optional: true,
      title: "payload",
      path: "payload"
    })
  ]);

  if (error) throw error;

  const headersError = findError([
    string(params.headers.trace, {
      optional: true,
      title: "trace",
      path: "headers.trace"
    }),
    string(params.headers.root, {
      optional: true,
      title: "root",
      path: "headers.root"
    }),
    object(params.headers.source, {
      optional: true,
      title: "source",
      path: "headers.source"
    }),
    date(params.headers.issued, {
      title: "issued date",
      headers: "headers.issued"
    })
  ]);

  if (headersError) throw headersError;

  if (
    new Date() < new Date(params.headers.issued) ||
    new Date().getTime() - new Date(params.headers.issued).getTime() >
      SECONDS_IN_DAY * 1000
  ) {
    throw deps.badRequestError.message("The issued timestamp seems incorrect.");
  }
};
