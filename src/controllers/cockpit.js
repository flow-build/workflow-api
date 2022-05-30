const { getCockpit } = require('../engine');
const { logger } = require('../utils/logger');

module.exports.fetchWorkflowsWithProcessStatusCount = async (ctx, next) => {
  logger.verbose('[KW] Called fetchWorkflowsWithProcessStatusCount');
  const cockpit = getCockpit();
  const filters = ctx.query;

  const workflows = await cockpit.fetchWorkflowsWithProcessStatusCount(filters);
  ctx.status = 200;
  ctx.body = {
    workflows
  };

  return next();
};

module.exports.setProcessState = async (ctx, next) => {
  logger.verbose('[KW] Called setProcessState');

  const cockpit = getCockpit();
  const process_id = ctx.params.id;
  const state_data = ctx.request.body;
  const result = await cockpit.setProcessState(process_id, state_data);
  ctx.status = 200;
  ctx.body = result.serialize();

  return next();
};

module.exports.runPendingProcess = async (ctx, next) => {
  logger.verbose('[KW] Called runPendingProcess');

  const cockpit = getCockpit();
  const process_id = ctx.params.id;
  const actor_data = ctx.request.body;

  await cockpit.runPendingProcess(process_id, actor_data);
  ctx.status = 202;

  return next();
};
