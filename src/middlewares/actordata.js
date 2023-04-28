const { logger } = require("../utils/logger");
const _ = require("lodash");

const customMap = {
  actor_id: process.env.JWT_PATH_ACTOR_ID || "actor_id",
  claims: process.env.JWT_PATH_CLAIMS || "claims",
  session_id: process.env.JWT_PATH_SESSION_ID || "session_id",
};

const mapDefaultData = (ctx) => {
  const actor_id = _.get(ctx.state.user, customMap.actor_id);
  const claims = _.get(ctx.state.user, customMap.claims);
  const session_id = _.get(ctx.state.user, customMap.session_id);
  const trace = {
    tracestate: ctx.request.headers.tracestate,
    traceparent: ctx.request.headers.traceparent,
  };

  return { actor_id, claims, session_id, trace };
};

const mapExtraData = (user) => {
  let keys;
  if (!process.env.JWT_EXTRA_KEYS) {
    const allkeys = Object.keys(user);
    const defaultKeys = Object.values(customMap);
    keys = allkeys.filter((key) => !defaultKeys.includes(key));
  } else {
    keys = process.env.JWT_EXTRA_KEYS.split(",");
  }

  let extData = {};
  if (keys && keys.length > 0) {
    for (const key of keys) {
      if (user[key]) {
        extData[key] = user[key];
      }
    }
  }

  return extData;
};

const captureActorData = async (ctx, next) => {
  logger.debug("captureActorData");
  if (!ctx.state.user) {
    logger.debug("empty token payload");
    ctx.status = 401;
    ctx.body = {
      message: "User data not found",
      error: ctx.state.jwtOriginalError,
    };
    return;
  }

  const defaultData = mapDefaultData(ctx);

  if (!defaultData.actor_id) {
    logger.debug("no actor_id");
    ctx.status = 401;
    ctx.body = { message: "Actor id not found" };
    return;
  }

  if (!Array.isArray(defaultData.claims)) {
    logger.debug("invalid claims");
    ctx.status = 401;
    ctx.body = { message: "Invalid claims" };
    return;
  }

  if (ctx.state.actor_data) {
    ctx.state.actor_data["actor_id"] = defaultData.actor_id;
    ctx.state.actor_data["claims"] = defaultData.claims;
    ctx.state.actor_data.trace = defaultData.trace;
    ctx.state.actor_data["session_id"] = defaultData.session_id;
  } else {
    ctx.state.actor_data = defaultData;
  }

  ctx.state.actor_data.extData = mapExtraData(ctx.state.user);

  return next();
};

module.exports = {
  captureActorData,
};
