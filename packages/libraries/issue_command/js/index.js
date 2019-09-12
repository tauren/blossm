const datetime = require("@sustainers/datetime");
const request = require("@sustainers/request");

module.exports = ({ action, domain, network }) => {
  return {
    with: (payload, { trace, source } = {}) => {
      const header = {
        issued: datetime.fineTimestamp(),
        ...(trace != undefined && { trace }),
        ...(source != undefined && { source })
      };

      return {
        in: async context =>
          await request.post(
            `https://${process.env.SERVICE}.command.${network}/${domain}/${action}`,
            {
              payload,
              header,
              context
            }
          )
      };
    }
  };
};
