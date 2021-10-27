const { v1: uuid } = require("uuid");
const { nanoid } = require("nanoid");
const { createJWTToken } = require("../services/tokenGenerator");
const { jwtSecret } = require("../utils/jwtSecret");
const { logger } = require("../utils/logger");

const getToken = (ctx, next) => {
  logger.verbose("Called getToken");
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
  } else if (!Array.isArray(body.claims)) {
    let claims = [];
    claims.push(body.claims);
    body.claims = claims;
  }

  body.session_id = nanoid();

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