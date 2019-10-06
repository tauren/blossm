const hashString = require("@sustainers/hash-string");
const { post, put, get, delete: del } = require("@sustainers/request");

exports.hash = hashString;
exports.post = post;
exports.put = put;
exports.get = get;
exports.delete = del;