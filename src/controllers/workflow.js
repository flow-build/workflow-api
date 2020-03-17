const _ = require("lodash");
const { getEngine,
        getCockpit } = require("../engine");

const saveWorkflow = async (ctx, next) => {
  const engine = getEngine();
  const { name, description, blueprint_spec } = ctx.request.body;
  try {
    const workflow = await engine.saveWorkflow(name, description, blueprint_spec);
    ctx.status = 201;
    ctx.body = {
      workflow_id: workflow.id,
      workflow_url: `${ctx.header.host}${ctx.url}/${workflow.id}`
    };
  } catch (err) {
    ctx.status = 400;
    ctx.body = {error: err};
  }
};

const getWorkflowsForActor = async (ctx, next) => {
  const cockpit = getCockpit();
  const actor_data = ctx.state.actor_data;
  const workflows = await cockpit.getWorkflowsForActor(actor_data);
  ctx.status = 200;
  ctx.body = workflows;
};

const fetchWorkflow = async (ctx, next) => {
  const engine = getEngine();
  const workflow_id = ctx.params.id;
  const workflow = await engine.fetchWorkflow(workflow_id);
  if (workflow) {
    ctx.status = 200;
    ctx.body = workflow.serialize();
  }
  else {
    ctx.status = 404;
  }
};

const deleteWorkflow = async (ctx, next) => {
  const engine = getEngine();
  const workflow_id = ctx.params.id;
  const num_deleted = await engine.deleteWorkflow(workflow_id);
  if (num_deleted == 0) {
    ctx.status = 404;
  }
  else {
    ctx.status = 204;
  }
};

const fetchWorkflowProcessList = async (ctx, next) => {
  const cockpit = getCockpit();
  const workflow_id = ctx.params.id;
  const filters = { workflow_id: workflow_id };
  const processes = await cockpit.fetchProcessList(filters);
  ctx.status = 200;
  ctx.body = _.map(processes, process => process.serialize());
};

const createProcess = async (ctx, next) => {
  const engine = getEngine();
  const workflow_id = ctx.params.id;
  const actor_data = ctx.state.actor_data;
  const input = ctx.request.body;
  const process = await engine.createProcess(workflow_id, actor_data, input);
  if (process) {
    ctx.status = 201;
    ctx.body = {
      process_id: process.id,
      process_url: `${ctx.header.host}${ctx.url}/${process.id}`
    };
  }
  else {
    ctx.status = 404;
  }
};

const createProcessByName = async (ctx, next) => {
  const engine = getEngine();
  const workflow_name = ctx.params.name;
  const actor_data = ctx.state.actor_data;
  const input = ctx.request.body;
  const process = await engine.createProcessByWorkflowName(workflow_name, actor_data, input);
  if (process) {
    ctx.status = 201;
    ctx.body = {
      process_id: process.id,
      process_url: `${ctx.header.host}${ctx.url}/${process.id}`
    };
  }
  else {
    ctx.status = 404;
  }
};

module.exports = {
  saveWorkflow,
  getWorkflowsForActor,
  fetchWorkflow,
  fetchWorkflowProcessList,
  deleteWorkflow,
  createProcess,
  createProcessByName
};
