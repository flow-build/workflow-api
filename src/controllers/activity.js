const { getCockpit, getEngine } = require("../engine");

const fetchAvailableActivitiesForActor = async (ctx, next) => {
  const cockpit = getCockpit();
  const actor_data = ctx.state.actor_data;
  const query_params = ctx.request.query;
  const workflow_id = query_params.workflow_id;
  const filters = workflow_id ? { workflow_id: query_params.workflow_id } : {};
  const tasks = await cockpit.fetchAvailableActivitiesForActor(actor_data, filters);
  ctx.status = 200;
  ctx.body = tasks;
};

const fetchDoneActivitiesForActor = async (ctx, next) => {
  const cockpit = getCockpit();
  const actor_data = ctx.state.actor_data;
  const query_params = ctx.request.query;
  const workflow_id = query_params.workflow_id;
  const filters = workflow_id ? { workflow_id: query_params.workflow_id } : {};
  const tasks = await cockpit.fetchDoneActivitiesForActor(actor_data, filters);
  ctx.status = 200;
  ctx.body = tasks;
};

const fetchActivity = async (ctx, next) => {
  const cockpit = getCockpit();
  const actor_data = ctx.state.actor_data;
  const process_id = ctx.params.id;
  const tasks = await cockpit.fetchAvailableActivityForProcess(process_id, actor_data);
  ctx.status = 200;
  ctx.body = tasks;
};

const fetchActivityByActivityManagerId = async (ctx, next) => {
  const engine = getEngine();
  const actor_data = ctx.state.actor_data;
  const activity_manager_id = ctx.params.id;
  const tasks = await engine.fetchActivityManager(activity_manager_id, actor_data);
  ctx.status = 200;
  ctx.body = tasks;
};

const commitActivity = async (ctx, next) => {
  const cockpit = getCockpit();
  const actor_data = ctx.state.actor_data;
  const process_id = ctx.params.process_id;
  const external_input = ctx.request.body;
  const tasks = await cockpit.commitActivity(process_id, actor_data, external_input);
  ctx.status = 200;
  ctx.body = tasks;
};

const pushActivity = async (ctx, next) => {
  const cockpit = getCockpit();
  const actor_data = ctx.state.actor_data;
  const process_id = ctx.params.process_id;
  const tasks = await cockpit.pushActivity(process_id, actor_data);
  ctx.status = 200;
  ctx.body = tasks;
};

const submitByActivityManagerId = async (ctx, next) => {
  const engine = getEngine();
  const actor_data = ctx.state.actor_data;
  const activity_manager_id = ctx.params.activity_manager_id;
  const external_input = ctx.request.body;
  const result = await engine.submitActivity(activity_manager_id, actor_data, external_input);
  if (result && !result.error) {
    ctx.status = 202;
  } else {
    ctx.status = 500;
    ctx.body = result.error;
  }
}

module.exports = {
  fetchAvailableActivitiesForActor,
  fetchDoneActivitiesForActor,
  fetchActivityByActivityManagerId,
  fetchActivity,
  commitActivity,
  pushActivity,
  submitByActivityManagerId,
};
