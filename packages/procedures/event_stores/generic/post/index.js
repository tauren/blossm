const deps = require("./deps");

const { preconditionFailed, badRequest } = require("@blossm/errors");

module.exports = ({ saveEventFn, aggregateFn, publishFn }) => {
  return async (req, res) => {
    const topicParts = req.body.event.headers.topic.split(".");
    const topicDomain = topicParts[1];
    const topicService = topicParts[2];

    //eslint-disable-next-line
    console.log("received event: ", {
      event: req.body.event
    });
    if (
      topicDomain != process.env.DOMAIN ||
      topicService != process.env.SERVICE
    )
      throw badRequest.wrongEventStore({
        info: {
          expected: `${process.env.DOMAIN}.${process.env.SERVICE}`,
          actual: `${topicDomain}.${topicService}`
        }
      });

    const root = req.body.event.headers.root;

    const aggregate = await aggregateFn(root);

    const number = aggregate ? aggregate.headers.lastEventNumber + 1 : 0;

    if (req.body.number && req.body.number != number)
      throw preconditionFailed.eventNumberIncorrect({
        info: { expected: req.body.number, actual: number }
      });

    const now = deps.dateString();

    const event = {
      ...req.body.event,
      headers: {
        ...req.body.event.headers,
        number,
        idempotency: req.body.event.headers.idempotency || (await deps.uuid())
      },
      id: `${root}_${number}`,
      saved: now
    };

    //eslint-disable-next-line
    console.log("bout tobe saved event: ", event);
    const savedEvent = await saveEventFn(event);
    //eslint-disable-next-line
    console.log("saved event: ", savedEvent);
    await publishFn(savedEvent);

    res.status(204).send();
  };
};
