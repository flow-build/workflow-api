const { getEngine } = require('../engine');
const buildXmlDiagram = require('@flowbuild/nodejs-diagram-builder');
const { logger } = require('../utils/logger');
const { validate } = require("uuid");

const buildDiagram = async (ctx, next) => {
  logger.verbose('Called buildDiagram');
  const engine = getEngine();
  let { workflow_id, blueprint_spec, name } = ctx.request.body;
	
  let diagram;
	
  if(workflow_id) {
    const is_valid = validate(workflow_id);
    if (!is_valid) {
      ctx.status = 400;
      ctx.body = {
        message: "Invalid uuid",
      };
      return;
    }
    const workflow = await engine.fetchWorkflow(workflow_id);
    if(workflow) {
      blueprint_spec = workflow.blueprint_spec;
      name = workflow.name;
    } else {
      ctx.status = 404;
      ctx.body = { message: "No such workflow" };
      return;
    }
  }
    
  try {
    diagram = await buildXmlDiagram(blueprint_spec, name)
    ctx.status = 200;
    ctx.body = diagram;
  } catch (err) {
    ctx.status = 400;
    ctx.body = { message: `Failed at ${err.message}`, error: err };
  }

  return next();
};

module.exports = {
  buildDiagram
}