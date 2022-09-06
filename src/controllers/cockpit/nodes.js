const { getNode, NodeUtils } = require("@flowbuild/engine")
const { getCockpit } = require("../../engine");

const getNodes = async (ctx, next) => {
  const types = NodeUtils.getNodeTypes();
  const categories = NodeUtils.getNodeCategories();

  const cockpit = getCockpit();
  const actor_data = ctx.state.actor_data;
  const workflows = await cockpit.getWorkflowsForActor(actor_data);
  const nodes = workflows.flatMap(w => w.blueprint_spec.nodes);
  const typeKeys = Object.keys(types);
  const categoryKeys = Object.keys(categories)

  ctx.status = 200;
  ctx.body = {
    types: typeKeys.map(type => { return {
      type: type,
      nodes: nodes.filter(node => node.type.toLowerCase() === type).length
    }}),
    categories: categoryKeys.map(category => { return {
      category: category,
      nodes: nodes.filter(node => node.category?.toLowerCase() === category).length
    }})
  }
  return next()
}

const fetchNode = async (ctx,next) => {
  const node = getNode(ctx.request.body)
  ctx.status = 200;
  ctx.body = {
    schema: node.constructor.schema
  }
  return next();
}

module.exports = {
  getNodes,
  fetchNode
}