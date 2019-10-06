const errors = require("@sustainers/errors");

const deps = require("./deps");

const common = ({ method, operation, root, data }) => {
  return {
    in: ({ context, service, network }) => {
      return {
        with: async ({ path = "", tokenFn } = {}) => {
          const operationHash = deps
            .hash(operation.join("") + service)
            .toString();

          const url = `http://${operationHash}.${network}${path}${
            root != undefined ? `/${root}` : ""
          }`;
          const token = tokenFn ? await tokenFn(operationHash) : null;

          const response = await method(
            url,
            {
              ...(data != undefined && { ...data }),
              context
            },
            token
              ? {
                Authorization: `Bearer ${token}`
              }
              : undefined
          );

          //eslint-disable-next-line no-console
          console.log("response: ", { url, response });
          if (response.statusCode >= 300) {
            throw errors.construct({
              statusCode: response.statusCode,
              message: response.body
                ? JSON.parse(response.body).message || "Not specified"
                : null
            });
          }
          if (response.statusCode == 204) return null;

          return JSON.parse(response.body);
        }
      };
    }
  };
};

module.exports = (...operation) => {
  return {
    post: data => common({ method: deps.post, operation, data }),
    put: (root, data) => common({ method: deps.put, operation, root, data }),
    delete: root => common({ method: deps.delete, operation, root }),
    get: query => {
      const root = query.root;
      delete query.root;
      return common({ method: deps.get, operation, root, data: query });
    }
  };
};
