require("localenv");
const { expect } = require("chai");
const uuid = require("@blossm/uuid");
const { subscribe } = require("@blossm/gcp-pubsub");

const request = require("@blossm/request");

const url = `http://${process.env.MAIN_CONTAINER_NAME}`;

describe("Event store", () => {
  it("should return successfully", async () => {
    const root = uuid();
    const topic = "some-topic";
    const version = 0;
    const created = "now";
    const id = "some-id";
    const action = "some-action";
    const domain = "some-domain";
    const service = "some-service";
    const network = "some-network";
    const issued = "now";

    subscribe({
      topic,
      name: "some-sub",
      fn: (err, subscription, apiResponse) => {
        //eslint-disable-next-line
        console.log("stuff: ", { err, subscription, apiResponse });
      }
    });

    const response0 = await request.post(url, {
      body: {
        headers: {
          root,
          topic,
          version,
          created,
          command: {
            id,
            action,
            domain,
            service,
            network,
            issued
          }
        },
        payload: {
          name: "some-name"
        }
      }
    });

    expect(response0.statusCode).to.equal(204);

    const response1 = await request.get(`${url}/${root}`);

    expect(response1.statusCode).to.equal(200);
    expect(JSON.parse(response1.body).state.name).to.equal("some-name");

    const response2 = await request.post(url, {
      body: {
        headers: {
          root,
          topic,
          version,
          created,
          command: {
            id,
            action,
            domain,
            service,
            network,
            issued
          }
        },
        payload: {
          name: "some-other-name"
        }
      }
    });
    expect(response2.statusCode).to.equal(204);

    const response3 = await request.get(`${url}/${root}`);

    expect(response3.statusCode).to.equal(200);
    expect(JSON.parse(response3.body).state.name).to.equal("some-other-name");
  });
  // it("should return an error if incorrect params", async () => {
  //   const response = await request.post(url, { name: 1 });
  //   expect(response.statusCode).to.be.at.least(400);
  // });
});
