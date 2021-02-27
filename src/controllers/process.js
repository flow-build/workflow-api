const _ = require("lodash");
const { getCockpit } = require("../engine");

const fetchProcess = async (ctx, next) => {
  const cockpit = getCockpit();
  const process_id = ctx.params.id;
  const process = await cockpit.fetchProcess(process_id);
  if (process) {
    ctx.status = 200;
    ctx.body = process.serialize();
  }
  else {
    ctx.status = 404;
  }
};

const fetchProcessList = async (ctx, next) => {
  const cockpit = getCockpit();
  const query_params = ctx.request.query;
  const workflow_id = query_params.workflow_id;
  const filters = workflow_id ? { workflow_id: workflow_id } : {};
  const processes = await cockpit.fetchProcessList(filters);
  ctx.status = 200;
  ctx.body = _.map(processes, process => process.serialize());
};

const fetchProcessStateHistory = async (ctx, next) => {
  const cockpit = getCockpit();
  const process_id = ctx.params.id;
  const states = await cockpit.fetchProcessStateHistory(process_id);
  if (states) {
    ctx.status = 200;
    ctx.body = _.map(states, state => state.serialize());
  }
  else {
    ctx.status = 404;
  }
};

const runProcess = async (ctx, next) => {
  const cockpit = getCockpit();
  const process_id = ctx.params.id;
  const actor_data = ctx.state.actor_data;
  const input = ctx.request.body;
  const res = await cockpit.runProcess(process_id, actor_data, input);
  ctx.status = res ? 200 : 404;
};

const abortProcess = async (ctx, next) => {
  const cockpit = getCockpit();
  const process_id = ctx.params.id;
  const actor_data = ctx.state.actor_data;
  const res = await cockpit.abortProcess(process_id, actor_data);
  ctx.status = res ? 200 : 404;
};

const setProcessState = async (ctx, next) => {
  const cockpit = getCockpit();
  const process_id = ctx.params.id;
  const actor_data = ctx.state.actor_data;
  const process_state_data = ctx.request.body.process_state;
  const res = await cockpit.setProcessState(process_id, actor_data,
                                            process_state_data);
  ctx.status = res ? 200 : 404;
};

module.exports = {
  fetchProcess,
  fetchProcessList,
  fetchProcessStateHistory,
  runProcess,
  abortProcess,
  setProcessState
};
