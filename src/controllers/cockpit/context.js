const { logger } = require('../../utils/logger')
const { db } = require("../../utils/db");
const { setDbConnection } = require("../../services/context");
const contextService = require('../../services/context')

const listContext = async (ctx, next) =>  {
  logger.verbose("[cockpit] called listContext");
      
  setDbConnection(db);

  const response = await contextService.fetchAll()
      
  ctx.body = response;
  ctx.status = 200
    
  return next();
}

const getContext = async (ctx, next) =>  {
  logger.verbose("[cockpit] called getContext");
      
  setDbConnection(db);

  const id = ctx.params.id;

  const response = await contextService.fetch(id)
      
  ctx.body = response;
  ctx.status = 200
    
  return next();
}

const listContextByNode = async (ctx, next) =>  {
  logger.verbose("[cockpit] called listContextByNode");
        
  const workflowName = ctx.params.name;
  const nodeId = ctx.params.nodeId;
  setDbConnection(db);
  
  const response = await contextService.fetchByWorkflow(workflowName,nodeId)
        
  ctx.body = response;
  ctx.status = 200
      
  return next();
}

const createContext = async (ctx, next) => {
  logger.verbose("[cockpit] called createContext");
  const context = ctx.request.body;

  setDbConnection(db);

  const response = await contextService.save(context)

  ctx.body = response;
  ctx.status = 201
      
  return next();

}

module.exports = {
  listContext,
  getContext,
  listContextByNode,
  createContext
}