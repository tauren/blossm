const add = require("./src/add");
const hydrate = require("./src/hydrate");

const deps = require("./deps");

const rowKeyDelineator = "#";
const columnFamilyId = "a";
const columnQualifier = "a";

module.exports = ({ domain, service }) => {
  const instance = deps.bigtable.instance(process.env.STORE_INSTANCE);
  const tableName = `${service}-${domain}`;
  return {
    add: add({
      instance,
      tableName,
      rowKeyDelineator,
      columnFamilyId,
      columnQualifier
    }),
    hydrate: hydrate({
      instance,
      tableName,
      rowKeyDelineator,
      columnFamilyId,
      columnQualifier
    })
  };
};
