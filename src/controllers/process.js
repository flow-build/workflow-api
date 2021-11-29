const _ = require("lodash");
const { getCockpit } = require("../engine");
const { logger } = require("../utils/logger");

const stoppedStatus = ["finished","interrupted","error"]

const serializeState = (state) => {
  return {
    id: state._id,
    created_at: state._created_at,
    process_id: state._process_id,
    step_number: state._step_number,
    node_id: state._node_id,
    next_node_id: state._next_node_id,
    bag: state._bag,
    external_input: state._external_input,
    result: state._result,
    error: state._error,
    status: state._status,
    actor_data: state._actor_data,
    engine_id: state._engine_id,
    time_elapsed: state._time_elapsed,
  };
};

const serializeProcess = (process) => {
  const state = process.state;
  return {
    id: process.id,
    created_at: process._created_at,
    workflow_id: process._workflow_id,
    state: state ? serializeState(state) : undefined,
    current_state_id: process._current_state_id,
    current_status: process._current_status,
  };
};

const fetchProcess = async (ctx, next) => {
  logger.verbose("called fetchProcess");

  const cockpit = getCockpit();
  const processId = ctx.params.id;
  const process = await cockpit.fetchProcess(processId);
  if (process) {
    ctx.status = 200;
    ctx.body = serializeProcess(process);
  } else {
    ctx.status = 404;
  }

  return next();
};

const fetchProcessList = async (ctx, next) => {
  logger.verbose("Called fetchProcessList");

  const cockpit = getCockpit();
  const query_params = ctx.request.query;
  const workflowId = query_params.workflow_id;
  const filters = workflowId ? { workflow_id: workflowId } : {};
  const processes = await cockpit.fetchProcessList(filters);
  ctx.status = 200;
  ctx.body = _.map(processes, (process) => {
    return serializeProcess(process);
  });

  return next();
};

const fetchProcessStateHistory = async (ctx, next) => {
  logger.verbose("called fetchProcessStateHistory");

  const cockpit = getCockpit();
  const processId = ctx.params.id;
  const states = await cockpit.fetchProcessStateHistory(processId);
  if (states) {
    ctx.status = 200;
    ctx.body = _.map(states, (state) => serializeState(state));
  } else {
    ctx.status = 404;
  }

  return next();
};

const runProcess = async (ctx, next) => {
  logger.verbose("called runProcess");

  const cockpit = getCockpit();
  const processId = ctx.params.id;
  const actor_data = ctx.state.actor_data;
  const input = ctx.request.body;

  const process = await cockpit.fetchProcess(processId);
  if (process) {
    if(stoppedStatus.includes(process._current_status)) {
      ctx.status = 422;
      ctx.body = {
        current_status: process._current_status
      }
    } else {
      const res = await cockpit.runProcess(processId, actor_data, input);
      ctx.status = res ? 200 : 404;
    }
  } else {
    ctx.status = 404;
  }

  return next();
};

const abortProcess = async (ctx, next) => {
  logger.verbose("Called abortProcess");

  const cockpit = getCockpit();
  const processId = ctx.params.id;
  const actorData = ctx.state.actor_data;

  const process = await cockpit.fetchProcess(processId);
  if (process) {
    if(stoppedStatus.includes(process._current_status)) {
      ctx.status = 422;
      ctx.body = {
        current_status: process._current_status
      }
    } else {
      const res = await cockpit.abortProcess(processId, actorData);
      ctx.status = res ? 200 : 404;    
    }
  } else {
    ctx.status = 404;
  }
  
  return next();
};

module.exports = {
  fetchProcess,
  fetchProcessList,
  fetchProcessStateHistory,
  runProcess,
  abortProcess,
};
