const { logger } = require("../utils/logger");
const TraceParent = require("traceparent");

const captureTraceData = async (ctx, next) => {
  logger.debug("middleware captureTraceData");
  const tracesettings = { transactionSampleRate: 1 };
  
  let parent;
  if (ctx.request.headers?.traceparent) {
    logger.silly('old traceparent: ', ctx.request.headers.traceparent)
    parent = TraceParent.fromString(ctx.request.headers.traceparent);
  } else {
    logger.silly('no traceparent: ')
  }

  const traceparent = TraceParent.startOrResume(parent, tracesettings);

  const trace = {
    tracestate: ctx.request.headers.tracestate,
    traceparent: traceparent.toString(),
  };

  if (ctx.state.actor_data) {
    ctx.state.actor_data.trace = trace;
  } else {
    ctx.state.actor_data = {
      trace: trace,
    };
  }

  logger.silly('new traceparent: ', traceparent.toString())

  return next();
};

module.exports = {
  captureTraceData,
};
