const { logger } = require('../../utils/logger')
const { getNode }  = require("@flowbuild/engine");
const { getStateById, getProcessById } = require('../state');

const prepareNode = async (ctx, next) =>  {
  logger.verbose("[cockpit] called prepareNode");
    
  const stateId = ctx.params.id;

  const state = await getStateById(stateId);
  const process = await getProcessById(state._process_id);
    
  const spec = process._blueprint_spec.nodes.find(node => node.id === state._node_id)
  const node = await getNode(spec)
  const response = await node._preProcessing({ 
    bag: state._bag, 
    input: state._result, 
    actor_data: state._actor_data, 
    environment: process._blueprint_spec?.environment, 
    parameters: process._blueprint_spec?.parameters 
  });

  ctx.body = {
    input: response,
    node
  };
  ctx.status = 200
  
  return next();
}

const prepareNodeDry = async (ctx, next) => {
  logger.verbose("[cockpit] called dryPrepareNode");
  const { spec, bag, result, actor_data, environment, parameters } = ctx.request.body;

  const node = await getNode(spec);

  const response = await node._preProcessing({ bag, input: result, actor_data, environment, parameters });

  ctx.status = 200;
  ctx.body = {
    input: response,
    node
  };

  return next();
}

const runNode = async (ctx, next) => {
  logger.verbose("[cockpit] called prepareNode");
    
  const stateId = ctx.params.id;
  
  const state = await getStateById(stateId);
  const process = await getProcessById(state._process_id);
      
  const spec = process._blueprint_spec.nodes.find(node => node.id === state._node_id)
  const node = await getNode(spec)
  const response = await node.run({ 
    bag: state._bag, 
    input: state._result, 
    external_input: state._external_input,
    actor_data: state._actor_data, 
    environment: process._blueprint_spec?.environment, 
    parameters: process._blueprint_spec?.parameters 
  }, null);
  
  ctx.status = 200;
  ctx.body = response;
    
  return next();
}

const dryRunNode = async (ctx, next) => {
  logger.verbose("[cockpit] called runNode");
  const { spec, bag, result, external_input, actor_data, environment, parameters } = ctx.request.body;

  const node = await getNode(spec);

  const response = await node.run(
    {
      bag,
      input: result,
      external_input,
      actor_data,
      environment,
      parameters,
    },
    null
  );

  ctx.status = 200;
  ctx.body = response;

  return next();
}

module.exports = {
  prepareNode,
  prepareNodeDry,
  dryRunNode,
  runNode
}