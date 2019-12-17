require("localenv");
const { expect } = require("chai");

const request = require("@blossm/request");
const uuid = require("@blossm/uuid");

const url = `http://${process.env.MAIN_CONTAINER_NAME}`;

describe("View store", () => {
  const id = uuid();
  it("should return successfully", async () => {
    const response0 = await request.put(`${url}/${id}`, {
      body: {
        code: "some-code",
        phone: "some-phone",
        expires: "some-date"
      }
    });

    expect(response0.statusCode).to.equal(204);

    const response1 = await request.get(`${url}/${id}`);
    const parsedBody1 = JSON.parse(response1.body);
    expect(response1.statusCode).to.equal(200);
    expect(parsedBody1.code).to.equal("some-code");
    expect(parsedBody1.phone).to.equal("some-phone");
    expect(parsedBody1.expires).to.equal("some-date");

    const response2 = await request.put(`${url}/${id}`, {
      body: {
        code: "some-other-code"
      }
    });
    expect(response2.statusCode).to.equal(204);

    const response3 = await request.get(`${url}/${id}`);
    const parsedBody3 = JSON.parse(response3.body);
    expect(response3.statusCode).to.equal(200);
    expect(parsedBody3.code).to.equal("some-other-code");
    expect(parsedBody3.phone).to.equal("some-phone");
    expect(parsedBody3.expires).to.equal("some-date");

    const response4 = await request.get(`${url}?code=some-other-code`);
    const parsedBody4 = JSON.parse(response4.body);
    expect(response4.statusCode).to.equal(200);
    expect(parsedBody4[0].code).to.equal("some-other-code");

    const response5 = await request.get(url);
    const parsedBody5 = JSON.parse(response5.body);
    expect(response5.statusCode).to.equal(200);
    expect(parsedBody5[0].code).to.equal("some-other-code");

    const id2 = uuid();
    const response6 = await request.put(`${url}/${id2}`, {
      body: {
        code: "some-other-code"
      }
    });

    expect(response6.statusCode).to.equal(204);

    let counter = 0;
    await request.stream(`${url}/stream`, data => {
      counter++;
      const parsedData = JSON.parse(data.toString().trim());
      expect(parsedData.code).to.equal("some-other-code");
    });
    expect(counter).to.equal(2);

    const response7 = await request.delete(`${url}/${id}`);
    const parsedBody7 = JSON.parse(response7.body);
    expect(response7.statusCode).to.equal(200);
    expect(parsedBody7.deletedCount).to.equal(1);

    const response8 = await request.delete(`${url}/${id2}`);
    const parsedBody8 = JSON.parse(response8.body);
    expect(response8.statusCode).to.equal(200);
    expect(parsedBody8.deletedCount).to.equal(1);

    const response9 = await request.get(`${url}/${id}`);
    expect(response9.statusCode).to.equal(404);
  });

  it("should return an error if incorrect params", async () => {
    const response = await request.post(url, { body: { code: { a: 1 } } });
    expect(response.statusCode).to.equal(500);
  });
});