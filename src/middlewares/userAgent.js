const { logger } = require("../utils/logger");
const RequestIp = require("@supercharge/request-ip");

const captureUserAgentAndIp = async (ctx, next) => {
  logger.debug("[MIDDLEWARES] captureUserAgentAndIp");
  const clientIp = RequestIp.getClientIp(ctx.request);
  const userAgent = {
    isMobile: ctx.userAgent._agent.isMobile,
    os: ctx.userAgent._agent.os,
    version: ctx.userAgent._agent.version,
    browser: ctx.userAgent._agent.browser,
    platform: ctx.userAgent._agent.platform,
  }

  if (ctx.state.actor_data) {
    ctx.state.actor_data.userAgent = userAgent;
    ctx.state.actor_data.requestIp = clientIp;
  } else {
    ctx.state.actor_data = {
      userAgent: userAgent,
      requestIp: clientIp,
    };
  }

  return next();
};

module.exports = {
  captureUserAgentAndIp
}