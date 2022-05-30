const _ = require("lodash");
const { getEngine, getCockpit } = require("../engine");
const { compareBlueprints } = require("../services/compareBlueprints");
const { logger } = require("../utils/logger");
const { validateEnvironmentVariable } = require("../validators/workflow");

const saveWorkflow = async (ctx, next) => {
  logger.verbose("Called saveWorkflow");

  const engine = getEngine();
  const { workflow_id, name, description, blueprint_spec } = ctx.request.body;

  try {
    const response = await engine.saveWorkflow(name, description, blueprint_spec, workflow_id);
    const environmentValidation = validateEnvironmentVariable(blueprint_spec);
    logger.debug("Workflow Created");
    if (!response.error) {
      const workflow = await engine.fetchWorkflow(response.id);
      ctx.status = 201;
      ctx.body = {
        workflow_id: workflow.id,
        hash: workflow._blueprint_hash,
        version: workflow._version,
        warnings: environmentValidation
      };
    } else {
      ctx.status = 400;
      ctx.body = {
        message: `Failed at ${response.error.errorType}`,
        error: response.error.message,
      };
    }
  } catch (err) {
    ctx.status = 500;
    ctx.body = { message: `Failed at ${err.message}`, error: err };
  }

  return next();
};

const getWorkflowsForActor = async (ctx, next) => {
  logger.verbose("Called getWorkflowsForActor");

  const cockpit = getCockpit();
  const actor_data = ctx.state.actor_data;
  const workflows = await cockpit.getWorkflowsForActor(actor_data);
  ctx.status = 200;
  ctx.body = _.map(workflows, (workflow) => {
    const result = workflow;
    return {
      workflow_id: result.id,
      created_at: result.created_at,
      name: result.name,
      description: result.description,
      version: result.version,
      hash: result.blueprint_hash,
    };
  });

  return next();
};

const listWorkflowsEnviromentVariables = async (ctx, next) => {
  logger.verbose("[KW] Called listWorkflowsEnviromentVariables");

  const cockpit = getCockpit();
  const workflows = await cockpit.getWorkflows();

  ctx.status = 200;
  ctx.body = workflows
    .filter((i) => _.size(i.blueprint_spec.environment) > 0)
    .reduce((result, item) => {
      let envs = _.keys(item.blueprint_spec.environment);
      envs.map((env) => {
        if (!result[env]) {
          result[env] = [];
        }
        result[env].push(`${item.name} - v${item.version}`);
      });
      return result;
    }, {});

  return next();
};

const fetchWorkflow = async (ctx, next) => {
  logger.verbose("Called fetchWorkflow");

  const engine = getEngine();
  const workflow_id = ctx.params.id;
  const result = await engine.fetchWorkflow(workflow_id);
  if (result) {
    ctx.status = 200;
    ctx.body = {
      workflow_id: result.id,
      created_at: result.created_at,
      name: result.name,
      description: result.description,
      version: result._version,
      hash: result._blueprint_hash,
      blueprint_spec: result.blueprint_spec,
    };
  } else {
    ctx.status = 204;
  }

  return next();
};

const fetchWorkflowByName = async (ctx, next) => {
  logger.verbose("Called fetchWorkflowByName");

  const engine = getEngine();
  const workflow_name = ctx.params.name;
  const result = await await engine.fetchWorkflowByName(workflow_name);
  if (result) {
    ctx.status = 200;
    ctx.body = {
      workflow_id: result.id,
      created_at: result.created_at,
      name: result.name,
      description: result.description,
      version: result._version,
      hash: result._blueprint_hash,
      blueprint_spec: result.blueprint_spec,
    };
  } else {
    ctx.status = 204;
  }

  return next();
};

const deleteWorkflow = async (ctx, next) => {
  logger.verbose("Called deleteWorkflow");

  const engine = getEngine();
  const cockpit = getCockpit();
  const workflowId = ctx.params.id;
  const workflow = await engine.fetchWorkflow(workflowId);
  if (!workflow) {
    (ctx.status = 404),
    (ctx.body = ctx.body =
        {
          message: "No such workflow",
        });
    return;
  }

  const filters = { workflow_id: workflowId };
  const processes = await cockpit.fetchProcessList(filters);
  if (processes.length > 0) {
    (ctx.status = 422),
    (ctx.body = ctx.body =
        {
          message: "Cannot delete workflows with processes",
        });
    return;
  }

  const numDeleted = await engine.deleteWorkflow(workflowId);
  if (numDeleted == 0) {
    ctx.status = 404;
  } else {
    ctx.status = 204;
  }

  return next();
};

const fetchWorkflowProcessList = async (ctx, next) => {
  logger.verbose("Called fetchWorkflowProcessList");

  const cockpit = getCockpit();
  const workflow_id = ctx.params.id;
  const filters = { workflow_id: workflow_id };
  const processes = await cockpit.fetchProcessList(filters);
  ctx.status = 200;
  ctx.body = _.map(processes, (process) => {
    const result = process.serialize();
    return {
      id: result.id,
      created_at: result.created_at,
      workflow_id: result.workflow_id,
      status: result.current_status,
      state: {
        id: result.state.id,
        step_number: result.state.step_number,
        node_id: result.state.node_id,
        next_node_id: result.state.next_node_id,
        node_name: result.blueprint_spec.nodes.find((i) => i.id === result.state.node_id).name,
      },
    };
  });

  return next();
};

const createProcess = async (ctx, next) => {
  logger.verbose("Called createProcess");

  const engine = getEngine();
  const workflow_id = ctx.params.id;
  const actor_data = ctx.state.actor_data;
  const input = ctx.request.body;
  const workflow = await engine.fetchWorkflow(workflow_id); 
  
  if (workflow) {
    const process = await engine.createProcess(workflow_id, actor_data, input);
    if (process) {
      ctx.status = 201;
      ctx.body = {
        process_id: process.id,
        workflow: {
          id: workflow.id,
          name: workflow.name,
          version: workflow._version,
        }
      };
    } else {
      ctx.status = 404;
      ctx.body = { message: `Failed while creating process` };
    }
  } else {
    ctx.status = 404;
    ctx.body = { message: `No such workflow` };
  }
  

  return next();
};

const createProcessByName = async (ctx, next) => {
  logger.verbose("Called createProcessByName");

  const engine = getEngine();
  const workflow_name = ctx.params.name;
  const actor_data = ctx.state.actor_data;
  const input = ctx.request.body;

  const workflow = await await engine.fetchWorkflowByName(workflow_name);

  if (workflow) {
    const process = await engine.createProcessByWorkflowName(workflow_name, actor_data, input);
    if (process) {
      ctx.status = 201;
      ctx.body = {
        process_id: process.id,
        workflow: {
          id: workflow.id,
          name: workflow.name,
          version: workflow._version,
        }
      };
    } else {
      ctx.status = 404;
      ctx.body = { message: `Failed while creating process` };
    }
  } else {
    ctx.status = 404;
    ctx.body = { message: `No such workflow` };
  }

  return next();
};

const createAndRunProcessByName = async (ctx, next) => {
  logger.verbose("Called createAndRunProcessByName");

  const engine = getEngine();
  const workflow_name = ctx.params.workflowName;
  const actor_data = ctx.state.actor_data;
  const input = ctx.request.body;

  const workflow = await await engine.fetchWorkflowByName(workflow_name);

  if (workflow) {
    const process = await engine.createProcessByWorkflowName(workflow_name, actor_data, input);
    if (process && process.id) {
      engine.runProcess(process.id, actor_data);
      ctx.status = 201;
      ctx.body = {
        process_id: process.id,
        workflow: {
          id: workflow.id,
          name: workflow.name,
          version: workflow._version,
        }
      };
    } else {
      ctx.status = 404;
      ctx.body = { message: `Failed while creating process` };
    }
  } else {
    ctx.status = 404;
    ctx.body = { message: `No such workflow` };
  }

  return next();
};

const validateBlueprint = async (ctx, next) => {
  logger.verbose("Called validateBlueprint");

  const engine = getEngine();
  const { blueprint_spec } = ctx.request.body;

  try {
    await engine.validateBlueprint(blueprint_spec);
    ctx.status = 200;
    ctx.body = {
      message: "Blueprint is valid",
    };
  } catch (err) {
    ctx.status = 400;
    ctx.body = {
      error: "Invalid blueprint",
      message: `Failed at ${err.message}`,
    };
  }

  return next();
};

const compareBlueprint = async (ctx, next) => {
  logger.verbose("Called compareBlueprint");
  const { name, blueprint_spec } = ctx.request.body;

  try {
    const compare = await compareBlueprints(name, blueprint_spec);

    if (compare.error) {
      ctx.status = 400;
      ctx.body = {
        error: "Invalid blueprint",
        message: `Failed at ${compare.error}`,
      };
    } else if (compare.changes) {
      if (compare.current_workflow) {
        ctx.status = 202;
        ctx.body = {
          status: "Changes found, check comparison",
          current_workflow: compare.current_workflow,
          comparison: compare.comparison,
        };
      } else {
        (ctx.status = 404),
        (ctx.body = {
          status: "No workflow with this name",
        });
      }
    } else {
      (ctx.status = 200),
      (ctx.body = {
        status: "No changes found",
        current_workflow: compare.current_workflow,
      });
    }
  } catch (err) {
    logger.error(err);
    ctx.status = 500;
    ctx.body = {
      error: err,
    };
  }

  return next();
};

module.exports = {
  saveWorkflow,
  getWorkflowsForActor,
  listWorkflowsEnviromentVariables,
  fetchWorkflow,
  fetchWorkflowByName,
  fetchWorkflowProcessList,
  deleteWorkflow,
  createProcess,
  createProcessByName,
  createAndRunProcessByName,
  validateBlueprint,
  compareBlueprint,
};
