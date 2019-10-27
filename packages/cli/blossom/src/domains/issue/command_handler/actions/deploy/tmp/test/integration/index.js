const { expect } = require("chai");
const { string: stringDate } = require("@sustainers/datetime");
const eventStore = require("@sustainers/event-store-js");
const uuid = require("@sustainers/uuid");

const request = require("@sustainers/request");

const deps = require("../../deps");

const url = `http://${process.env.MAIN_CONTAINER_NAME}`;

const root = uuid();

describe("Command handler store integration tests", () => {
  it("should return successfully", async () => {
    const phone = "919-357-1144";
    await deps
      .viewStore({
        name: "phones",
        domain: "person-account",
        service: process.env.SERVICE,
        network: process.env.NETWORK
      })
      .update(root, { phone });

    // console.log("0: ", { url });
    const response = await request.post(url, {
      body: {
        headers: {
          issued: stringDate()
        },
        payload: {
          phone
        }
      }
    });
    // console.log("response: ", response);

    const aggregate = await eventStore({
      domain: process.env.DOMAIN,
      service: process.env.SERVICE,
      network: process.env.NETWORK
    }).aggregate(root);

    expect(aggregate.headers.root).to.equal(root);
    expect(aggregate.state.phone).to.equal("+19193571144");
    expect(response.statusCode).to.equal(200);

    const response1 = await deps
      .viewStore({
        name: "phones",
        domain: "person-account",
        service: process.env.SERVICE,
        network: process.env.NETWORK
      })
      .delete(root);

    const parsedBody1 = JSON.parse(response1.body);
    expect(response1.statusCode).to.equal(200);
    expect(parsedBody1.deletedCount).to.equal(1);
  });
  it("should return an error if incorrect params", async () => {
    const phone = 3;
    const response = await request.post(url, {
      body: {
        headers: {
          issued: stringDate()
        },
        payload: {
          phone
        }
      }
    });

    // console.log(response.body);

    expect(response.statusCode).to.equal(409);
  });
});
