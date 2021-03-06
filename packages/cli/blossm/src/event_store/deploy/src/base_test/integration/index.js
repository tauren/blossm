require("localenv");
const { expect } = require("chai");
const request = require("@blossm/request");
const uuid = require("@blossm/uuid");

const {
  domain,
  service,
  testing,
  schema,
  indexes
} = require("../../config.json");

const url = `http://${process.env.MAIN_CONTAINER_NAME}`;

const {
  subscribe,
  create,
  delete: del,
  unsubscribe
} = require("@blossm/gcp-pubsub");

const topic = `some-topic.${process.env.DOMAIN}.${process.env.SERVICE}`;
const sub = "some-sub";
const version = 0;
const created = "now";
const id = "some-id";
const network = "some-network";
const issued = "now";
const name = "some-command-name";

describe("Event store integration tests", () => {
  const example0 = testing.examples.first;
  const example1 = testing.examples.second;

  before(async () => await create(topic));
  after(async () => await del(topic));

  it("should have examples", () => {
    expect(example0).to.exist;
    expect(example1).to.exist;
  });

  it("should return successfully", async () => {
    const root = await uuid();

    const response0 = await request.post(url, {
      body: {
        event: {
          headers: {
            root,
            topic,
            action: example0.action,
            domain,
            service,
            version,
            created,
            command: {
              id,
              name,
              domain,
              service,
              network,
              issued
            }
          },
          payload: example0.payload
        }
      }
    });

    expect(response0.statusCode).to.equal(204);

    const response1 = await request.get(`${url}/${root}`);
    expect(response1.statusCode).to.equal(200);

    const parsedBody1 = JSON.parse(response1.body);
    for (const property in example0.payload) {
      expect(parsedBody1.state[property]).to.deep.equal(
        example0.payload[property]
      );
    }

    const response2 = await request.post(url, {
      body: {
        event: {
          headers: {
            root,
            topic,
            version,
            created,
            action: example1.action,
            domain,
            service,
            command: {
              id,
              name,
              domain,
              service,
              network,
              issued
            }
          },
          payload: example1.payload
        }
      }
    });

    expect(response2.statusCode).to.equal(204);

    const response3 = await request.get(`${url}/${root}`);
    expect(response3.statusCode).to.equal(200);

    const parsedBody3 = JSON.parse(response3.body);
    for (const property in example1) {
      expect(parsedBody3.state[property]).to.deep.equal(
        example1.payload[property]
      );
    }

    ///Test indexes
    for (const index of indexes || []) {
      const example = [example1, example0].find(e => e.payload[index]);
      const response4 = await request.get(url, {
        query: {
          key: [index],
          value: example.payload[index]
        }
      });
      expect(response4.statusCode).to.equal(200);

      const parsedBody4 = JSON.parse(response4.body);
      for (const key in example1.result || example1) {
        expect(parsedBody4[0].state[key]).to.deep.equal(example1.payload[key]);
      }
    }
  });

  it("should publish event successfully", done => {
    subscribe({
      topic,
      name: sub,
      fn: async (_, subscription) => {
        if (!subscription) throw "Subscription wasn't made";
        subscription.once("message", async event => {
          const eventString = Buffer.from(event.data, "base64")
            .toString()
            .trim();
          const json = JSON.parse(eventString);
          for (const property in example0.payload) {
            expect(json.payload[property]).to.deep.equal(
              example0.payload[property]
            );
          }
          await unsubscribe({ topic, name: sub });
          done();
        });
        const root = await uuid();
        request.post(url, {
          body: {
            event: {
              headers: {
                root,
                topic,
                version,
                created,
                action: example0.action,
                domain,
                service,
                command: { id, name, domain, service, network, issued }
              },
              payload: example0.payload
            }
          }
        });
      }
    });
  });
  const testIncorrectParams = async ({ payload, action }) => {
    const root = await uuid();
    const response = await request.post(url, {
      body: {
        event: {
          headers: {
            root,
            topic,
            version,
            created,
            action,
            domain,
            service,
            command: { id, name, domain, service, network, issued }
          },
          payload
        }
      }
    });
    expect(response.statusCode).to.equal(500);
  };

  const findBadValue = (schema, property) => {
    return schema[property] == "String" ||
      (typeof schema[property] == "object" &&
        (schema[property]["type"] == "String" ||
          (typeof schema[property]["type"] == "object" &&
            schema[property]["type"]["type"] == "String")))
      ? { a: 1 } //pass an object to a String property
      : "some-string"; // or, pass a string to a non-String property
  };

  const badObjectValue = async (key, schema) => {
    for (const property in schema) {
      const badValue = findBadValue(schema, property);
      await testIncorrectParams({
        payload: {
          ...example0.payload,
          [key]: { [property]: badValue }
        },
        action: example0.action
      });
    }
  };

  it("should return an error if incorrect params", async () => {
    //Grab a property from the schema and pass a wrong value to it.
    for (const property in schema) {
      let badValue;
      if (
        typeof schema[property] == "object" &&
        schema[property]["type"] == undefined
      ) {
        badValue = await badObjectValue(property, schema[property]);
        return;
      } else {
        badValue = findBadValue(schema, property);
      }

      const [exampleToUse] = [
        example0,
        example1,
        ...(testing.examples.more || [])
      ].filter(example => example.payload[property] != undefined);

      if (!exampleToUse) return;

      await testIncorrectParams({
        payload: { ...exampleToUse.payload, [property]: badValue },
        action: exampleToUse.action
      });
    }
  });

  it("should return an error if bad number", async () => {
    const root = await uuid();

    const response = await request.post(url, {
      body: {
        event: {
          headers: {
            root,
            topic,
            version,
            created,
            action: testing.action,
            domain,
            service,
            command: {
              id,
              name,
              domain,
              service,
              network,
              issued
            }
          },
          payload: example0
        },
        number: 2
      }
    });
    expect(response.statusCode).to.equal(412);
  });
  it("should return an error if two simultaneous events are attempted", async () => {
    const root = await uuid();

    const [response0, response1] = await Promise.all([
      request.post(url, {
        body: {
          event: {
            headers: {
              root,
              topic,
              version,
              created,
              action: example0.action,
              domain,
              service,
              command: {
                id,
                name,
                domain,
                service,
                network,
                issued
              }
            },
            payload: example0.payload
          }
        }
      }),

      request.post(url, {
        body: {
          event: {
            headers: {
              root,
              topic,
              version,
              created,
              action: example1.action,
              domain,
              service,
              command: {
                id,
                name,
                domain,
                service,
                network,
                issued
              }
            },
            payload: example1.payload
          }
        }
      })
    ]);

    if (response0.statusCode == 204) {
      expect(response1.statusCode).to.equal(412);
    } else {
      expect(response0.statusCode).to.equal(412);
      expect(response1.statusCode).to.equal(204);
    }
  });
  it("should return an error if action is not recognized", async () => {
    const root = await uuid();

    const response = await request.post(url, {
      body: {
        event: {
          headers: {
            root,
            topic,
            version,
            created,
            action: "bogus",
            domain,
            service,
            command: {
              id,
              name,
              domain,
              service,
              network,
              issued
            }
          },
          payload: example0.payload
        }
      }
    });

    expect(response.statusCode).to.equal(400);
  });
});
