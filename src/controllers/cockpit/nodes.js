const { getNode, NodeUtils } = require("@flowbuild/engine")
const { getCockpit } = require("../../engine");
const _ = require('lodash')

const getNodesTypes = async (ctx, next) => {
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

const fetchNodeSpec = async (ctx,next) => {
  let body = ctx.request.body;

  if(body.type.toLowerCase() === 'systemtask' && !body.category) {
    ctx.status = 400;
    ctx.body = {
      message: "Invalid Request Body",
      error: [{
        message: "systemTasks must have required property category"
      }]
    }
    return next();
  }

  try {
    const node = getNode(ctx.request.body)
    ctx.status = 200;
    ctx.body = {
      schema: node.constructor.schema
    }
    return next();
  } catch (e) {
    console.log(e)
    ctx.status = 404;
    ctx.body = {
      message: e.toString()
    }
  }
}

function buildEndpoint(node) {
  if(!node.parameters?.request?.url) {
    return undefined
  }

  const verb = node.parameters?.request?.verb;
  const url = node.parameters?.request?.url?.$mustache || node.parameters?.request?.url?.$js || node.parameters?.request?.url
  
  return `${verb} ${url}`
}

function nodes(workflow) {
  const dNodes = workflow.nodes.map(node => {
    return {
      workflow: {
        id: workflow.id,
        name: workflow.name,
        version: workflow.version,
      },
      node: node,
      endpoint: buildEndpoint(node)
    }
  })
  return dNodes;
}

function filterNodes(nodes, type, category) {
  const categories = _.isArray(category) ? category : [category?.toLowerCase()];
  const types = _.isArray(type) ? type : [type?.toLowerCase()];
  return nodes.filter(item => {
    if(category) {
      if(categories.includes(item.node.category?.toLowerCase())) {
        return item
      } 
    } else {
      if(types.includes(item.node.type.toLowerCase())) {
        return item
      }
    }    
  })
}

const getNodes = async (ctx, next) => {
  const { type, category } = ctx.request.body;
  console.log(`type: ${type}, category: ${category}`)
  const cockpit = getCockpit();
  const workflows = await cockpit.getWorkflows();

  const myNodes = workflows.map((item) => {
    const iworkflow = {
      id: item.id,
      name: item.name,
      version: item.version,
      nodes: item.blueprint_spec.nodes
    }
    const t = nodes(iworkflow);
    return t;
  }).flat();

  ctx.status = 200;
  ctx.body = filterNodes(myNodes, type, category)

  return next();

}

module.exports = {
  getNodesTypes,
  fetchNodeSpec,
  getNodes
}