const { logger } = require("../utils/logger");

const captureActorData = async (ctx, next) => {
  logger.debug("captureActorData");
  if (!ctx.state.user) {
    logger.debug("empty token payload");
    ctx.status = 401;
    ctx.body = {
      message: "User data not found",
    };
    return;
  }
  const actor_id = ctx.state.user.actor_id;

  if (!actor_id) {
    logger.debug("no actor_id");
    ctx.status = 401;
    ctx.body = { message: "Actor id not found" };
    return;
  }

  const claims = ctx.state.user.claims;
  if (!Array.isArray(claims)) {
    logger.debug("invalid claims");
    ctx.status = 401;
    ctx.body = { message: "Invalid claims" };
    return;
  }

  let trace;
  trace = {
    tracestate: ctx.request.headers.tracestate,
    traceparent: ctx.request.headers.traceparent,
  };

  const session_id = ctx.state.user.session_id;

  if (ctx.state.actor_data) {
    (ctx.state.actor_data["actor_id"] = actor_id), (ctx.state.actor_data["claims"] = claims);
    ctx.state.actor_data.trace = trace;
    ctx.state.actor_data["session_id"] = session_id;
  } else {
    ctx.state.actor_data = { trace, actor_id, claims, session_id };
  }

  return next();
};

module.exports = {
  captureActorData,
};
