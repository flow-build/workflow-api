const { logger } = require('../../utils/logger')
const { db } = require("../../utils/db");
const { setDbConnection } = require("../../services/spec");
const specService = require('../../services/spec');

function serialize(spec) {
  return {
    id: spec.id || uuid(),
    created_at: spec.createdAt || new Date(),
    name: spec.name,
    element_type: spec.element,
    node_lane_id: spec.node.laneId,
    node_name: spec.node.name,
    node_type: spec.node.type,
    node_category: spec.node.category,
    node_parameters: spec.node.parameters,
    compose_spec_id: spec.composeNodeId
  }
}

function deserialize(spec) {
  return {
    id: spec.id,
    name: spec.name,
    element: spec.element_type,
    node: {
      laneId: spec.node_lane_id,
      name: spec.node_name,
      type: spec.node_type,
      category: spec.node_category,
      parameters: spec.node_parameters
    }
  }
}

const getSpec = async (ctx, next) =>  {
  logger.verbose("[cockpit] called getSpec");
      
  const id = ctx.params.id;

  setDbConnection(db);

  const response = await specService.fetch(id)
      
  ctx.body = deserialize(response);
  ctx.status = 200
    
  return next();
}

const listSpecByType = async (ctx, next) =>  {
  logger.verbose("[cockpit] called getSpecByType");
          
  const type = ctx.params.type
  setDbConnection(db);
    
  const response = await specService.fetchByType(type)
          
  ctx.body = response.map(item => deserialize(item));
  ctx.status = 200
        
  return next();
}

const getSpecByName = async (ctx, next) =>  {
  logger.verbose("[cockpit] called getSpecByName");
        
  const name = ctx.params.name
  setDbConnection(db);
  
  const response = await specService.fetchByName(name)
        
  ctx.body = deserialize(response);
  ctx.status = 200
      
  return next();
}

const createSpec = async (ctx, next) => {
  logger.verbose("[cockpit] called createSpec");
  const spec = ctx.request.body;

  setDbConnection(db);

  const response = await specService.save(serialize(spec))

  ctx.body = deserialize(response);
  ctx.status = 201
      
  return next();

}

module.exports = {
  getSpec,
  getSpecByName,
  listSpecByType,
  createSpec
}