const _ = require("lodash");
const { getCockpit, getEngine } = require("../engine");
const { logger } = require("../utils/logger");

const stoppedStatus = ["finished", "interrupted", "error"];

const serializeState = (state) => {
  return {
    id: state._id,
    created_at: state._created_at,
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
    time_elapsed: state._time_elapsed
  };
};

const serializeProcess = (process) => {
  const state = process.state;
  return {
    id: process.id,
    created_at: process._created_at,
    workflow: {
      id: process._workflow_id,
      name: process._workflow.name,
      version: process._workflow.version,
      isLatest: process._workflow.isLatest
    },
    state: state ? serializeState(state) : undefined
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

const listProcesses = async (ctx, next) => {
  logger.verbose("Called listProcesses");

  const filters = ctx.request.body;

  const cockpit = getCockpit();

  const processes = await cockpit.fetchProcessList(filters);
  ctx.status = 200;
  ctx.body = _.map(processes, (process) => {
    return serializeProcess(process);
  });

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
  const qs = ctx.query
  const filters = {
    fromStep: qs.fromStep || null
  }
  const states = await cockpit.fetchProcessStateHistory(processId, filters);
  if (states) {
    if (states.length) {
      ctx.status = 200;
      ctx.body = _.map(states, (state) => serializeState(state));
      return next();
    }
    ctx.status = 204;
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
    if (stoppedStatus.includes(process._current_status)) {
      ctx.status = 422;
      ctx.body = {
        current_status: process._current_status,
      };
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
    if (stoppedStatus.includes(process._current_status)) {
      ctx.status = 422;
      ctx.body = {
        current_status: process._current_status,
      };
    } else {
      const res = await cockpit.abortProcess(processId, actorData);
      ctx.status = res ? 200 : 404;
    }
  } else {
    ctx.status = 404;
  }

  return next();
};

const fetchStateByParameters = async (ctx, next) => {
  logger.verbose("called fetchStateByParameters");

  const cockpit = getCockpit();
  const processId = ctx.params.id;
  const nodeId = ctx.request.query.nodeId;
  const stepNumber = parseInt(ctx.request.query.stepNumber);

  if (!nodeId && !stepNumber) {
    ctx.status = 400;
    ctx.body = {
      message: "you should define at least one param (nodeId or stepNumber)",
    };
    return next();
  }

  const process = await cockpit.fetchProcess(processId);
  const states = await cockpit.fetchProcessStateHistory(processId);

  if (!states) {
    ctx.status = 404;
    ctx.body = {
      message: "process not found",
    };
    return next();
  }

  let filteredStates;

  if (stepNumber) {
    filteredStates = states.filter((item) => item._step_number === stepNumber);
  } else if (nodeId) {
    filteredStates = states.filter((item) => item._node_id == nodeId);
  }
  if (filteredStates.length > 0) {
    ctx.status = 200;
    ctx.body = {
      environment: process?._blueprint_spec?.environment,
      parameters: process?._blueprint_spec?.parameters,
      states: _.map(filteredStates, (state) => serializeState(state))
    }
  } else {
    ctx.status = 404;
    ctx.body = {
      message: "no state found with the parameter provided",
      params: {
        nodeId,
        stepNumber
      }
    };
  }

  return next();
};

const continueProcess = async (ctx, next) => {
  logger.verbose("called continueProcess");

  const engine = getEngine();
  const processId = ctx.params.id;
  const actorData = ctx.state.actor_data;
  const input = ctx.request.body;

  const result = await engine.continueProcess(processId, actorData, input); //TODO: implement a default value to signal that the process has continued due to a continue call
  if (result?.error) {
    ctx.status = 422;
    ctx.body = result.error;
    return next();
  }

  ctx.status = 200;
  ctx.body = {
    message: "Process continue signaled"
  }
  return next();
};

module.exports = {
  fetchProcess,
  fetchProcessList,
  fetchProcessStateHistory,
  listProcesses,
  runProcess,
  abortProcess,
  fetchStateByParameters,
  continueProcess
};
