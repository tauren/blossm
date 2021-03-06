const mongoose = require("mongoose");

const connect = require("./connect");
const deps = require("../deps");

const unravelMixins = ({ schema = {}, indexes = [], mixins = [] }) => {
  const mixin = {
    schema,
    indexes,
    mixins
  };

  const result = [mixin];

  mixin.mixins.reverse().forEach(nestedMixin => {
    const nestedMixins = unravelMixins(nestedMixin);
    result.unshift(...nestedMixins);
  });

  return result;
};

const formattedMixins = root => {
  const allMixins = unravelMixins(root);

  const allSchemas = allMixins.map(mixin => mixin.schema);
  const allIndexes = allMixins.map(mixin => mixin.indexes);

  const formattedSchemas = viewStore => {
    for (const schema of allSchemas) viewStore.add(schema);
  };

  const formattedIndexes = viewStore => {
    for (const indexes of allIndexes) {
      for (const index of indexes) {
        viewStore.index(...index);
      }
    }
  };

  return [formattedSchemas, formattedIndexes];
};

module.exports = ({
  name,
  schema,
  indexes,
  mixins = [],
  version = 0,
  connection: {
    protocol,
    user,
    password,
    host,
    database,
    parameters,
    poolSize,
    autoIndex,
    onError,
    onOpen
  } = {}
}) => {
  if (name == undefined || name.length == 0)
    throw deps.internalServerError.message("View store needs a name.");

  if (
    user != undefined &&
    password != undefined &&
    host != undefined &&
    protocol != undefined &&
    database != undefined
  ) {
    connect({
      protocol,
      user,
      password,
      host,
      database,
      parameters,
      poolSize,
      autoIndex,
      onError,
      onOpen
    });
  }

  const base = {
    schema,
    indexes,
    mixins
  };

  const store = new mongoose.Schema(
    {},
    { strict: schema != undefined, typePojoToMixed: false, minimize: false }
  );

  formattedMixins(base).forEach(mixin => mixin(store));

  store.add({
    version: {
      type: Number,
      default: version
    }
  });

  const storeName = `${name}.${version}`;
  return mongoose.model(storeName, store, name);
};
