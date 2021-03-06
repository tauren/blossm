const { expect } = require("chai");
const { construct } = require("..");

const message = "some-message";
describe("Construct", () => {
  it("400 correct", () => {
    const error = construct({ statusCode: 400, message });
    expect(error.toJSON()).to.deep.equal({
      statusCode: 400,
      code: "BadRequest",
      info: {},
      message
    });
  });
  it("401 correct", () => {
    const error = construct({ statusCode: 401, message });
    expect(error.toJSON()).to.deep.equal({
      statusCode: 401,
      code: "Unauthorized",
      info: {},
      message
    });
  });
  it("409 correct", () => {
    const error = construct({ statusCode: 409, message });
    expect(error.toJSON()).to.deep.equal({
      statusCode: 409,
      code: "InvalidArgument",
      info: {},
      message
    });
  });
  it("404 correct", () => {
    const error = construct({ statusCode: 404, message });
    expect(error.toJSON()).to.deep.equal({
      statusCode: 404,
      code: "ResourceNotFound",
      info: {},
      message
    });
  });
  it("500 correct", () => {
    const error = construct({ statusCode: 500, message });
    expect(error.toJSON()).to.deep.equal({
      statusCode: 500,
      code: "InternalServer",
      info: {},
      message
    });
  });
});
