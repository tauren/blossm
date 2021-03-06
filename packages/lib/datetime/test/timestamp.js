const { expect } = require("chai")
  .use(require("chai-datetime"))
  .use(require("sinon-chai"));
const { useFakeTimers } = require("sinon");

const { timestamp } = require("..");

let clock;

const now = new Date();

describe("Creates correctly", () => {
  beforeEach(() => {
    clock = useFakeTimers(now.getTime());
  });

  afterEach(() => {
    clock.restore();
  });

  it("it should return a timestamp that equals now", async () => {
    const nowTimestamp = timestamp();
    const nowTimestampToMilliseconds = nowTimestamp * 1000;

    expect(new Date(nowTimestampToMilliseconds)).to.equalDate(now);
  });
});
