const { v1: uuid } = require("uuid");
const { createJWTToken } = require("../services/tokenGenerator");
const { jwtSecret } = require("../utils/jwtSecret");
const { logger } = require("../utils/logger");

const getToken = (ctx, next) => {
  logger.debug("called getToken");
  const secret = ctx.get("x-secret") || jwtSecret;
  const duration = parseInt(ctx.get("x-duration")) || 3600; // default is 1 hour

  const body = ctx.request.body || {};
  if (!body?.actor_id) {
    logger.debug("Set a random actor_id");
    body.actor_id = uuid();
  }
  if (!body?.claims) {
    logger.debug("Set an empty claims list");
    body.claims = [];
  }

  const jwtToken = createJWTToken(body, secret, duration);
  ctx.status = 200;
  ctx.body = {
    jwtToken,
    payload: body,
  };

  return next();
};

module.exports = {
  getToken,
};
