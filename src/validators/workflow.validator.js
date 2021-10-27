const { validateBodyWithSchema, validateDataWithSchema }  = require("./base.validator");
const { logger } = require("../utils/logger");
const { workflowSchema } = require('./schemas/workflow.schema');
const { nodeSchema, categorySchema } = require("./schemas/nodes.schemas");

validateSaveWorkflow = validateBodyWithSchema(workflowSchema);

validateCreateProcess = validateBodyWithSchema(
  {
    type: "object",
  });

const validateNodes = async (ctx, next) => {
  logger.debug("called validateNodes");
  const blueprintSpec = ctx.request.body.blueprint_spec;
  
  const validateNode = blueprintSpec.nodes.map(async (node) => {
    const nodeType = node.type.toLowerCase();
    let parametersValidation = {};
  
    let nodeCategory;
    if (nodeType === "systemtask") {
      nodeCategory = node.category.toLowerCase();
    }
  
    const typeValidation = await validateDataWithSchema(
      nodeSchema[nodeType],
      node
    );
  
    if (nodeCategory) {
      logger.silly("validate category");
      parametersValidation = await validateDataWithSchema(
        categorySchema[nodeCategory],
        node.parameters
      );
    } else {
      parametersValidation.is_valid = true;
    }
  
    return {
      data: node,
      isValid: typeValidation.is_valid && parametersValidation.is_valid,
      errors: [
        ...(typeValidation?.errors || []),
        ...(parametersValidation?.errors || []),
      ],
    };
  });
  
  const nodesResult = await Promise.all(validateNode);
  
  let errors = nodesResult.reduce((acc, item) => {
    if (item.isValid) {
      return acc;
    } else {
      return ++acc;
    }
  }, 0);
  
  if (errors > 0) {
    ctx.status = 400;
    ctx.body = {
      message: "Invalid Node",
      error: nodesResult
        .filter((item) => !item.isValid)
        .map((result) => {
          let response;
          response = {
            node: result.data.id,
            type: result.data.type,
            category: result.data.category,
            errors: result.errors.map((error) => {
              return {
                field: error.instancePath,
                message: error.message,
              };
            }),
          };
          return response;
        }),
    };
    return;
  } else {
    return await next();
  }
};

const validateConnections = async (ctx, next) => {
  logger.debug("called validateConnections");
  const blueprintSpec = ctx.request.body.blueprint_spec;

  const lanes = blueprintSpec.lanes.map((lane) => { return lane.id });

  const nodes = blueprintSpec.nodes.map((node) => { return node.id });

  const nodeConnections = blueprintSpec.nodes.map(async (node) => {
    return {
      id: node.id,
      name: node.name,
      unique: nodes.filter((item) => item === node.id).length === 1,
      lane: lanes.includes(node.lane_id),
      next: node.next ? nodes.includes(node.next) : true,
    };
  });

  const nodesResult = await Promise.all(nodeConnections);

  let errors = await nodesResult.reduce((acc, item) => {
    if (!item.lane || !item.next || !item.unique) {
      return ++acc;
    } else {
      return acc;
    }
  }, 0);

  let errorMessage = [];

  if (!isUnique(lanes)) { 
    errors++ 
    errorMessage.push({
      lanes: "There is a duplicated lane id"
    })
  }

  if (errors > 0) {
    ctx.status = 400;
    ctx.body = {
      message: "Invalid Connections",
      error: [...errorMessage, ...nodesResult.filter(
        (item) => !item.lane || !item.next || !item.unique
      )],
    };
    return;
  } else {
    return await next();
  }
};

const isUnique = (array) => {
  uniqueArray = [...new Set(array)];
  return array.length === uniqueArray.length;
};

module.exports = {
  saveWorkflow: validateSaveWorkflow,
  createProcess: validateCreateProcess,
  validateNodes,
  validateConnections,
};
