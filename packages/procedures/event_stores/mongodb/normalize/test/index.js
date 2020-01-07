const { expect } = require("chai");

const normalize = require("..");

describe("Mongodb event store normalize", () => {
  it("shouud call with the correct string", async () => {
    const result = normalize;
    expect(result).to.equal(
      "function() { const key = this.headers.root; const value = { headers: { root: this.headers.root, lastEventNumber: this.headers.number }, state: this.payload }; emit(key, value); }"
    );
  });
});
