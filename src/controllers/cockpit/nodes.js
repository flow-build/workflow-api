const { Nodes, getNode, NodeUtils } = require("@flowbuild/engine")

const getNodes = async (ctx, next) => {
  const nodes = Nodes;
  const types = NodeUtils.getNodeTypes();
  const categories = NodeUtils.getNodeCategories();
  ctx.status = 200;
  ctx.body = {
    nodes: Object.keys(nodes),
    types: Object.keys(types),
    categories: Object.keys(categories)
  }
  return next()
}

const fetchNode = async (ctx,next) => {
  const node = getNode(ctx.request.body)
  console.log('node', node)
  console.log('rules', node.constructor.schema)
  ctx.status = 200;
  ctx.body = {
    id: node.id,
    schema: node.constructor.schema
  }
  return next();
}

module.exports = {
  getNodes,
  fetchNode
}