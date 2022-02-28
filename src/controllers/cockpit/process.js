const cockpitService = require("../../services/cockpit");
const { getEngine, getCockpit } = require("../../engine");
const { logger } = require("../../utils/logger");

const setProcessState = async (ctx, next) => {
  logger.verbose("Called setProcessState");

  const cockpit = getCockpit();

  const process_id = ctx.params.id;
  const state_data = ctx.request.body;
  const process = await cockpit.fetchProcess(process_id);

  if (process) {
    const next_node = process._blueprint_spec.nodes.find((n) => n.id === state_data.next_node_id);
    if (next_node) {
      const result = await setState(process, state_data);
      ctx.status = 200;
      //TODO: add a dryrun to see the next node execution
      ctx.body = result;
    } else {
      ctx.status = 404;
      ctx.body = { message: "No such next_node" };
    }
  } else {
    ctx.status = 404;
    ctx.body = { message: "No such process" };
  }

  return next();
};

const transferProcessState = async (ctx, next) => {
  logger.verbose("Called transferProcessState");

  const cockpit = getCockpit();

  const process_id = ctx.params.id;
  const state_id = ctx.params.state_id;

  const process = await cockpit.fetchProcess(process_id);
  if (process) {
    const state = await cockpitService.fetchProcessState(state_id);
    if (state) {
      const next_node = process._blueprint_spec.nodes.find((n) => n.id === state.next_node_id);
      if (next_node) {
        const state_data = {
          next_node_id: state.next_node_id,
          bag: state.bag,
          result: state.result,
        };
        const result = await setState(process, state_data);
        ctx.status = 200;
        ctx.body = result;
      } else {
        ctx.status = 400;
        ctx.body = { message: "State incompatible to process" };
      }
    } else {
      ctx.status = 404;
      ctx.body = { message: "No such state" };
    }
  } else {
    ctx.status = 404;
    ctx.body = { message: "No such process" };
  }

  return next();
};

async function setState(process, state_data) {
  const cockpit = getCockpit();
  const process_id = process.id;
  const result = await cockpit.setProcessState(process_id, state_data);

  return {
    workflow_name: process.workflow_name,
    process_id: process._id,
    state: {
      state_id: result.id,
      step_number: result.step_number,
      node_id: result.node_id,
      next_node_id: result.next_node_id,
      status: result.status,
      result: result.result,
      bag: result.bag,
      actor_data: "actor data will bet set by state run",
    },
    message: "to resume process execute a state run",
  };
}

const runPendingProcess = async (ctx, next) => {
  logger.verbose("Called runPendingProcess");

  const cockpit = getCockpit();
  const process_id = ctx.params.id;
  const actor_data = ctx.request.body;
  const process = await cockpit.fetchProcess(process_id);

  if (process) {
    if (process._current_status === "pending") {
      try {
        cockpit.runPendingProcess(process_id, actor_data);
        ctx.status = 202;
        ctx.body = {
          message: "process resumed, get process to check its current state",
          process_url: `${ctx.header.host}/processes/${process_id}`,
        };
      } catch {
        ctx.status = 400;
        ctx.body = { message: `Failed at ${e.message}`, error: e };
      }
    } else {
      ctx.status = 422;
      ctx.body = { message: "Invalid process status" };
    }
  } else {
    ctx.status = 404;
    ctx.body = { message: "No such process" };
  }

  return next();
};

const getProcessesByWorkflowId = async (ctx, next) => {
  logger.verbose("Cockpit getProcessesByWorkflowId");

  const workflow_id = ctx.params.id;
  //TODO: Add status filter, limit and offset

  const engine = getEngine();
  const workflow = await engine.fetchWorkflow(workflow_id);

  if (workflow) {
    try {
      const result = await cockpitService.fetchWorkflowProcessesByWorkflowId(workflow_id);
      ctx.status = 200;
      ctx.body = result.map((p) => {
        let response = {
          process_id: p.id,
          created_at: p.created_at,
          state_id: p.current_state_id,
          status: p.current_status,
          workflow_name: p.name,
          workflow_version: p.version,
        };
        return response;
      });
    } catch (e) {
      ctx.status = 400;
      ctx.body = { message: `Failed at ${e.message}`, error: e };
    }
  } else {
    ctx.status = 404;
    ctx.body = { message: "No such workflow" };
  }

  return next();
};

const getProcessesByWorkflowName = async (ctx, next) => {
  logger.verbose("Cockpit getProcessesByWorkflowName");
  //TODO: Add status filter, limit and offset

  const workflow_name = ctx.params.name;

  const engine = getEngine();
  const workflow = await engine.fetchWorkflowByName(workflow_name);

  if (workflow) {
    try {
      const result = await cockpitService.fetchWorkflowProcessesByWorkflowName(workflow_name);
      ctx.status = 200;
      ctx.body = result.map((p) => {
        let response = {
          process_id: p.id,
          created_at: p.created_at,
          state_id: p.current_state_id,
          status: p.current_status,
          workflow_name: p.name,
          workflow_version: p.version,
        };
        return response;
      });
    } catch (e) {
      ctx.status = 400;
      ctx.body = { message: `Failed at ${e.message}`, error: e };
    }
  } else {
    ctx.status = 404;
    ctx.body = { message: "No such workflow" };
  }

  return next();
};

const getProcessExecution = async (ctx, next) => {
  logger.verbose("Cockpit getProcessExecution");

  const process_id = ctx.params.id;
  const cockpit = getCockpit();
  const process = await cockpit.fetchProcess(process_id);

  try {
    const result = await cockpitService.fetchProcessExecution(process_id);
    ctx.status = 200;
    ctx.body = result.map((s) => {
      let response = {
        state_id: s.id,
        step_number: s.step_number,
        node_type: process._blueprint_spec.nodes.find((n) => n.id === s.node_id).type,
        node: s.node_id + " - " + process._blueprint_spec.nodes.find((n) => n.id === s.node_id).name,
        next_node_id: s.next_node_id,
        status: s.status,
      };
      return response;
    });
  } catch (e) {
    ctx.status = 400;
    ctx.body = { message: `Failed at ${e.message}`, error: e };
  }

  return next();
};

const getStatesFromNode = async (ctx, next) => {
  const workflow_name = ctx.params.name;
  const node_id = ctx.params.node_id;

  //TODO: add query filters for date, status and pagination

  try {
    const result = await cockpitService.fetchStatesByNodeId(workflow_name, node_id);
    ctx.status = 200;
    ctx.body = result;
  } catch (e) {
    ctx.status = 400;
    ctx.body = { message: `Failed at ${e.message}`, error: e };
  }

  return next();
};

module.exports = {
  getProcessesByWorkflowId,
  getProcessesByWorkflowName,
  getProcessExecution,
  getStatesFromNode,
  setProcessState,
  transferProcessState,
  runPendingProcess,
};
