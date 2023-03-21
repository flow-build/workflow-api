const { getEngine, getCockpit } = require("../../engine");
const { logger } = require("../../utils/logger");

const expire = async (ctx, next) => {
  logger.verbose("Cockpit ActivityManager expire");
  
  const amid = ctx.params.id;
  const actor_data = ctx.state.actor_data;
  
  const engine = getEngine()

  const am = await engine.fetchActivityManager(amid, actor_data)
  if(!am) {
    ctx.status = 404;
    ctx.body = {
      message: "activity manager not found"
    }
    return next()
  }

  if(['completed', 'interrupted'].includes(am.activity_status)) {
    ctx.status = 409;
    ctx.body = {
      message: "activity manager cannot be expired",
      current_status: am.activity_status
    }
    return next()
  }

  const cockpit = getCockpit();
  

  try {
    cockpit.expireActivityManager(amid, actor_data);
    ctx.status = 200;
    ctx.body = {
      message: "Expire command submitted, check process history for current status"
    };
  } catch (e) {
    ctx.status = 400;
    ctx.body = { message: `Failed at ${e.message}`, error: e };
  }
  
  return next();
}
  
module.exports = {
  expire,
}