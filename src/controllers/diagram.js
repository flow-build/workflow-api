const { getEngine } = require('../engine');
const { buildXmlDiagram, buildBlueprintFromBpmn } = require('@flowbuild/nodejs-diagram-builder');
const { logger } = require('../utils/logger');
const { validate } = require("uuid");
const getRawBody = require('raw-body');

const buildDiagram = async (ctx, next) => {
  logger.verbose('Called buildDiagram');
  const engine = getEngine();
  let blueprint = ctx.request.body;
  const workflowId = blueprint?.workflow_id;
  let diagram;
	
  if(workflowId) {
    const is_valid = validate(workflowId);
    if (!is_valid) {
      ctx.status = 400;
      ctx.body = {
        message: "Invalid uuid",
      };
      return;
    }
    const workflow = await engine.fetchWorkflow(workflowId);
    if(!workflow) {
      ctx.status = 404;
      ctx.body = { message: "No such workflow" };
      return;
    }

    blueprint.name = workflow._name;
    blueprint.description = workflow._description;
    blueprint.blueprint_spec = workflow._blueprint_spec;
  }

  try {
    diagram = await buildXmlDiagram(blueprint)
    ctx.status = 200;
    ctx.body = diagram;
  } catch (err) {
    ctx.status = 400;
    ctx.body = { message: `Failed at ${err.message}`, error: err };
  }

  return next();
};

const buildBlueprint = async (ctx, next) => {
  logger.verbose('Called buildBlueprint');

  const diagram = await getRawBody(ctx.req)
	
  try {
    const result = await buildBlueprintFromBpmn(diagram);
    ctx.status = 200;
    ctx.body = result;
  } catch (err) {
    ctx.status = 400;
    ctx.body = { message: `Failed at ${err.message}`, error: err };
  }

  return next;

}

module.exports = {
  buildDiagram,
  buildBlueprint
}