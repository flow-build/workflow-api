const _ = require("lodash");
const { getCockpit } = require("../engine");
const { logger } = require("../utils/logger");

async function getStateById(id) {
  const cockpit = getCockpit();
  const state = await cockpit.getProcessState(id)
  return state;
}

async function getStateByStepNumber(processId, stepNumber) {
  const cockpit = getCockpit();
  const state = await cockpit.findProcessStatesByStepNumber(processId, stepNumber);
  return state;
}

async function getStateByNodeId(processId, nodeId) {
  const cockpit = getCockpit();
  const state = await cockpit.findProcessStatesByNodeId(processId, nodeId);
  return state;
}

async function getProcessById(id) {
  const cockpit = getCockpit();
  const process = await cockpit.fetchProcess(id);
  return process;
}

function serializeState(state) {
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
    time_elapsed: state._time_elapsed
  };
}

async function buildStateResponse(states, process) {
  let response = {};
  if(!_.isArray(states)) {
    response = {...serializeState(states), ...{ 
      environment: process?._blueprint_spec?.environment,
      parameters: process?._blueprint_spec?.parameters }
    }
    return response;  
  }

  if (states.length > 0) {
    response = {
      environment: process?._blueprint_spec?.environment,
      parameters: process?._blueprint_spec?.parameters,
      states: _.map(states, (state) => serializeState(state))
    }
  } else {
    response = {
      message: "no state found with the parameter provided",
      params: {
        nodeId,
        stepNumber  
      }
    };
  }

  return response;
}

const fetchById = async (ctx, next) => {
  logger.verbose("called fetchStateByParameters");
  const stateId = ctx.params.id;
  
  const state = await getStateById(stateId)
  if(!state) {
    ctx.status = 404;
    ctx.body = {
      message: "stateId not found",
    };
    return next()
  } 
  
  const processId = state._process_id;
  const process = await getProcessById(processId);
  const response = await buildStateResponse(state,process);
  
  ctx.status = 200;
  ctx.body = response;
  
  return next()
}

const fetchStateByParameters = async (ctx, next) => {
  logger.verbose("called fetchStateByParameters");
  
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
  
  const process = await getProcessById(processId);
  
  if (!process) {
    ctx.status = 404;
    ctx.body = {
      message: "process not found",
    };
    return next();
  }
  
  let states;
  
  if (stepNumber) {
    states = await getStateByStepNumber(processId, stepNumber)
  } else if (nodeId) {
    states = await getStateByNodeId(processId, nodeId)
  }

  console.log(states)

  if(!states) {
    ctx.status = 404;
    ctx.body = {
      message: "no state found with the parameter provided",
      params: {
        nodeId,
        stepNumber  
      }
    };
    return next();
  }

  const response = await buildStateResponse(states,process);
  
  ctx.status = 200;
  ctx.body = response;
  
  return next();
};

module.exports = {
  fetchById,
  fetchStateByParameters
}