const { customAlphabet } = require("nanoid");
const { v1:uuid } = require("uuid"); 
const { logger } = require('../../utils/logger')
const { db } = require("../../utils/db");
const { setDbConnection } = require("../../services/context");
const contextService = require('../../services/context')
const nanoId = customAlphabet('123456789QWERTYUIOPASDFGHJKLZXCVBNM',6)


function serialize(context, id) {
  return {
    id: id || uuid(),
    code: context.code || nanoId(),
    created_at: context.createdAt || new Date(),
    spec_name: context.spec,
    workflow_name: context.workflow,
    environment: context.enviroment,
    parameters: context.parameters,
    node_id: context.state.node_id,
    bag: context.state.bag,
    result: context.state.result,
    actor_data: context.state.actor_data,
    origin_state: {
      processId: context.state.process_id,
      stepNumber: context.state.step_number,
      createdAt: context.state.created_at
    }
  }
}

function deserialize(data) {
  return {
    code: data.code || nanoId(),
    workflow: data.workflow_name,
    node: data.node_id,
    context: {
      result: data.result,
      bag: data.bag,
      actor_data: data.actor_data,
      environment: data.environment,
      parameters: data.parameters
    },
    origin: data.origin_state
  }
}



const listContext = async (ctx, next) =>  {
  logger.verbose("[cockpit] called listContext");
      
  setDbConnection(db);

  const response = await contextService.fetchAll()
      
  ctx.body = response.map(item => deserialize(item));
  ctx.status = 200
    
  return next();
}

const getContext = async (ctx, next) =>  {
  logger.verbose("[cockpit] called getContext");
      
  setDbConnection(db);

  const id = ctx.params.id;

  const response = await contextService.fetch(id)
      
  ctx.body = deserialize(response);
  ctx.status = 200
    
  return next();
}

const listContextByNode = async (ctx, next) =>  {
  logger.verbose("[cockpit] called listContextByNode");
        
  const workflowName = ctx.params.name;
  const nodeId = ctx.params.nodeId;
  setDbConnection(db);
  
  const response = await contextService.fetchByWorkflow(workflowName,nodeId)
        
  ctx.body = response.map(item => deserialize(item));
  ctx.status = 200
      
  return next();
}

const createContext = async (ctx, next) => {
  logger.verbose("[cockpit] called createContext");
  const context = ctx.request.body;

  setDbConnection(db);

  const response = await contextService.save(serialize(context))

  ctx.body = deserialize(response);
  ctx.status = 201
      
  return next();

}

module.exports = {
  listContext,
  getContext,
  listContextByNode,
  createContext
}