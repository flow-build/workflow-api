const { getCockpit } = require("../../engine");
const { logger } = require("../../utils/logger");
const { validate } = require("uuid");

module.exports.fetchWorkflowsWithProcessStatusCount = async (ctx, next) => {
  logger.verbose("Called fetchWorkflowsWithProcessStatusCount");
  const cockpit = getCockpit();
  const filters = ctx.query;

  let is_valid = true;
  if (filters.workflow_id) {
    logger.debug("validating workflow_id");
    is_valid = validate(filters.workflow_id);
  }

  if (!is_valid) {
    ctx.status = 400;
    ctx.body = {
      message: "Invalid uuid",
    };
  } else {
    const workflows = await cockpit.fetchWorkflowsWithProcessStatusCount(filters);
    ctx.status = 200;
    ctx.body = {
      workflows,
    };
  }

  return next();
};