const _ = require("lodash");
const { getEngine, getCockpit } = require("../engine");
const { trimExecutionData, listNodes, listConnections, listUncoverage } = require("../services/coverage");
const { logger } = require("../utils/logger");

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
  const res = await cockpit.runProcess(processId, actor_data, input);
  ctx.status = res ? 200 : 404;

  return next();
};

const abortProcess = async (ctx, next) => {
  logger.verbose("Called abortProcess");

  const cockpit = getCockpit();
  const processId = ctx.params.id;
  const actor_data = ctx.state.actor_data;
  const res = await cockpit.abortProcess(processId, actor_data);
  ctx.status = res ? 200 : 404;

  return next();
};

const calculateCoverage = async (ctx, next) => {
  logger.info("Called calculateCoverage");

  const workflowId = ctx.params.id;
  const query_params = ctx.request.query;
  const limit = parseInt(query_params.limit);

  const engine = getEngine();
  const cockpit = getCockpit();

  const workflow = await engine.fetchWorkflow(workflowId);
  if(!workflow) {
    ctx.status = 404;
    return next;
  }

  const filters = {
    workflow_id: workflowId,
    limit: limit || 10
  }

  const processes = await cockpit.fetchProcessList(filters);

  const executionPromises = processes.map(process => {
    return cockpit.fetchProcessStateHistory(process.id);
  })

  const execution = await Promise.all(executionPromises);

  const executionData = trimExecutionData(execution)
  const blueprintNodes = await listNodes(workflow.blueprint_spec)
  const blueprintConnections = await listConnections(workflow.blueprint_spec)

  const uncoveredNodes = await listUncoverage(blueprintNodes, (await executionData).nodes);
  const uncoveredConnections = await listUncoverage(blueprintConnections, (await executionData).connections)

  ctx.status = 200;
  ctx.body = {
    workflow: {
      id: workflow._id,
      name: workflow._name,
      version: workflow._version
    },
    history: {
      processesEvaluated: processes.length,
      connections: blueprintConnections,
      nodes: blueprintNodes,
    },
    coverage: {
      nodes: {
        value: 100 * (1 - uncoveredNodes.length / blueprintNodes.length),
        uncovered: uncoveredNodes,
      },
      connections: {
        value:
          100 * (1 - uncoveredConnections.length / blueprintConnections.length),
        uncovered: uncoveredConnections,
      },
    },
  }

  return next;

}

module.exports = {
  fetchProcess,
  fetchProcessList,
  fetchProcessStateHistory,
  listProcesses,
  runProcess,
  abortProcess,
  calculateCoverage
};
