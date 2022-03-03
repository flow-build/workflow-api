const { logger } = require('../../utils/logger')
const { db } = require("../../utils/db");
const { setDbConnection } = require("../../services/spec");
const specService = require('../../services/spec')

const getSpec = async (ctx, next) =>  {
  logger.verbose("[cockpit] called getSpec");
      
  const id = ctx.params.id;

  setDbConnection(db);

  const response = await specService.fetch(id)
      
  ctx.body = response;
  ctx.status = 200
    
  return next();
}

const listSpecByType = async (ctx, next) =>  {
  logger.verbose("[cockpit] called getSpecByType");
          
  const type = ctx.params.type
  setDbConnection(db);
    
  const response = await specService.fetchByType(type)
          
  ctx.body = response;
  ctx.status = 200
        
  return next();
}

const getSpecByName = async (ctx, next) =>  {
  logger.verbose("[cockpit] called getSpecByName");
        
  const name = ctx.params.name
  setDbConnection(db);
  
  const response = await specService.fetchByName(name)
        
  ctx.body = response;
  ctx.status = 200
      
  return next();
}

const createSpec = async (ctx, next) => {
  logger.verbose("[cockpit] called createSpec");
  const spec = ctx.request.body;

  setDbConnection(db);

  const response = await specService.save(spec)

  ctx.body = response;
  ctx.status = 201
      
  return next();

}

module.exports = {
  getSpec,
  getSpecByName,
  listSpecByType,
  createSpec
}