const { expect } = require("chai");
const viewStore = require("@sustainers/view-store-js");

const request = require("@sustainers/request");

const url = `http://${process.env.MAIN_CONTAINER_NAME}`;

describe("Event handler store integration tests", () => {
  it("should return successfully", async () => {
    const name = "Some-name";
    const context = "some-context";
    const response = await request.post(url, {
      message: {
        data: Buffer.from(
          JSON.stringify({ headers: { context }, payload: { name } })
        )
      }
    });

    expect(response.statusCode).to.equal(204);

    const [view] = await viewStore({
      name: process.env.TARGET_NAME,
      domain: process.env.TARGET_DOMAIN,
      service: process.env.SERVICE,
      network: process.env.NETWORK
    })
      .read({ name })
      .in({})
      .with();

    expect(view.name).to.equal(name);

    const deletedResult = await viewStore({
      name: process.env.TARGET_NAME,
      domain: process.env.TARGET_DOMAIN,
      service: process.env.SERVICE,
      network: process.env.NETWORK
    })
      .delete(view.id)
      .in({})
      .with();

    expect(deletedResult.deletedCount).to.equal(1);
  });
  // it("should return an error if incorrect params", async () => {
  //   const name = 3;
  //   const response = await request.post(url, {
  //     headers: {
  //       issued: stringDate()
  //     },
  //     payload: {
  //       name
  //     }
  //   });

  //   expect(response.statusCode).to.equal(400);
  // });
});