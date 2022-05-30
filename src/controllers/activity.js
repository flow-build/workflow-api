/* eslint-disable indent */
const { getCockpit, getEngine } = require("../engine");
const { logger } = require("../utils/logger");

const serializeTask = (task) => {
  return {
    id: task.id,
    state_id: task.process_state_id,
    process_id: task.process_id,
    workflow_id: task.workflow_id,
    created_at: task.created_at,
    type: task.type,
    props: task.props,
    process_status: task.current_status,
    workflow_name: task.workflow_name,
    workflow_description: task.workflow_description,
    node_name: task.blueprint_spec.nodes.find((e) => e.id === task.node_id).name,
  };
};

const fetchAvailableActivitiesForActor = async (ctx, next) => {
  logger.verbose("Called fetchAvailableActivitiesForActor");

  const cockpit = getCockpit();
  const actor_data = ctx.state.actor_data;
  const query_params = ctx.request.query;
  const workflow_id = query_params.workflow_id;
  const filters = workflow_id ? { workflow_id: query_params.workflow_id } : {};
  let tasks = await cockpit.fetchAvailableActivitiesForActor(actor_data, filters);
  ctx.status = 200;
  ctx.body = tasks.map((task) => {
    return serializeTask(task);
  });

  return next();
};

const fetchAvailableActivitiesForActorReduced = async (ctx, next) => {
  logger.verbose("Called fetchAvailableActivitiesForActor");

  const cockpit = getCockpit();
  const actor_data = ctx.state.actor_data;
  const query_params = ctx.request.query;
  const workflow_id = query_params.workflow_id;
  const filters = workflow_id ? { workflow_id: query_params.workflow_id } : {};
  let tasks = await cockpit.fetchAvailableActivitiesForActor(actor_data, filters);
  tasks = tasks
    .filter((e) => ["finished", "interrupted", "pending"].indexOf(e.process_status) < 0)
    .map((task) => {
      let response = {
        activity_manager_id: task.id,
        process_id: task.process_id,
        workflow_id: task.workflow_id,
        created_at: task.created_at,
        type: task.type,
        workflow_name: task.workflow_name,
        process_status: task.process_status,
        node_name: task.blueprint_spec.nodes.find((e) => e.id === task.node_id).name,
        action: task.props.action,
      };
      return response;
    });
  ctx.status = 200;
  ctx.body = tasks;

  return next();
};

const fetchDoneActivitiesForActor = async (ctx, next) => {
  logger.verbose("Called fetchDoneActivitiesForActor");

  const cockpit = getCockpit();
  const actor_data = ctx.state.actor_data;
  const query_params = ctx.request.query;
  const workflow_id = query_params.workflow_id;
  const filters = workflow_id ? { workflow_id: query_params.workflow_id } : {};
  let tasks = await cockpit.fetchDoneActivitiesForActor(actor_data, filters);
  ctx.status = 200;
  ctx.body = tasks.map((task) => {
    return serializeTask(task);
  });

  return next();
};

const fetchActivity = async (ctx, next) => {
  logger.verbose("Called fetchActivity");

  const cockpit = getCockpit();
  const actor_data = ctx.state.actor_data;
  const process_id = ctx.params.id;
  const process = await cockpit.fetchProcess(process_id);
  let tasks;
  if (process) {
    switch (process._current_status) {
      case "running":
      case "delegated":
      case "pending":
      case "waiting":
        tasks = await cockpit.fetchAvailableActivityForProcess(process_id, actor_data);
        if (tasks) {
          ctx.status = 200;
          delete tasks.blueprint_spec;
          delete tasks.bag;
          delete tasks.process_status;
          delete tasks.external_input;
          delete tasks.node_id;
          delete tasks.next_node_id;
          ctx.body = tasks;
        } else {
          ctx.status = 204;
          ctx.body = {
            current_status: process._current_status
          }
        }
        return next();
      default:
        logger.warn(`Inactive status for PID ${process_id}`);
        ctx.status = 404;
        ctx.body = {
          current_status: process._current_status
        }
    }
  } else {
    logger.warn(`No process found for PID ${process_id}`);
    ctx.status = 404;
    ctx.body = {
      message: `No process found for PID ${process_id}`
    }
  }

  return next();
};

const fetchActivityByActivityManagerId = async (ctx, next) => {
  logger.verbose("Called fetchActivityByActivityManagerId");

  const engine = getEngine();
  const actor_data = ctx.state.actor_data;
  const activity_manager_id = ctx.params.id;
  const tasks = await engine.fetchActivityManager(activity_manager_id, actor_data);
  if (tasks) {
    ctx.status = 200;
    delete tasks.blueprint_spec;
    tasks.activities.sort((a, b) => {
      return a.created_at > b.created_at ? -1 : 0;
    });
    ctx.body = tasks;
  } else {
    ctx.status = 404;
  }

  return next();
};

const commitActivity = async (ctx, next) => {
  logger.verbose("Called commitActivity");

  const cockpit = getCockpit();
  const actor_data = ctx.state.actor_data;
  const process_id = ctx.params.id;
  const external_input = ctx.request.body;
  const tasks = await cockpit.commitActivity(process_id, actor_data, external_input);
  if (tasks.error) {
    switch (tasks.error.errorType) {
      case "activityManager":
        ctx.status = 404;
        ctx.body = tasks.error;
        break;
      case "commitActivity":
        ctx.status = 400;
        ctx.body = tasks.error;
        logger.info("invalid attempt to commit activity, error: ", tasks.error.message);
        break;
      default:
        ctx.status = 500;
        ctx.body = tasks.error;
        break;
    }
  } else {
    ctx.status = 200;
    ctx.body = tasks;
  }

  return next();
};

const pushActivity = async (ctx, next) => {
  logger.verbose("Called pushActivity");

  const cockpit = getCockpit();
  const actor_data = ctx.state.actor_data;
  const process_id = ctx.params.id;
  const response = await cockpit.pushActivity(process_id, actor_data);
  if (response && !response.error) {
    ctx.status = 202;
  } else {
    switch (response.error.errorType) {
      case "activityManager":
        ctx.status = 404;
        ctx.body = response.error;
        break;
      default:
        ctx.status = 500;
        ctx.body = response.error;
        break;
    }
  }

  return next();
};

const commitByActivityManagerId = async (ctx, next) => {
  logger.verbose("Called commitByActivityManagerId");
  const actor_data = ctx.state.actor_data;

  const engine = getEngine();
  const activity_manager_id = ctx.params.id;
  const activity_manager = await engine.fetchActivityManager(activity_manager_id, actor_data);

  if (activity_manager) {
    logger.debug("PID: ", activity_manager.process_id);

    const cockpit = getCockpit();
    const process_id = activity_manager.process_id;
    const external_input = ctx.request.body;
    const tasks = await cockpit.commitActivity(process_id, actor_data, external_input);
    if (tasks.error) {
      switch (tasks.error.errorType) {
        case "activityManager":
          ctx.status = 404;
          ctx.body = tasks.error;
          break;
        case "commitActivity":
          ctx.status = 400;
          ctx.body = tasks.error;
          logger.info("invalid attempt to commit activity, error: ", tasks.error.message);
          break;
        default:
          ctx.status = 500;
          ctx.body = tasks.error;
          break;
      }
    } else {
      ctx.status = 200;
      ctx.body = tasks;
    }
  } else {
    ctx.status = 404;
    ctx.body = {
      error: "Activity Manager not found",
    };
  }

  return next();
};

const submitByActivityManagerId = async (ctx, next) => {
  logger.verbose("Called submitByActivityManagerId");

  const engine = getEngine();
  const actor_data = ctx.state.actor_data;
  const activity_manager_id = ctx.params.id;
  const external_input = ctx.request.body;
  const result = await engine.submitActivity(activity_manager_id, actor_data, external_input);
  if (result && !result.error) {
    ctx.status = 202;
  } else {
    switch (result.error.errorType) {
      case "activityManager":
        ctx.status = 404;
        ctx.body = result.error;
        break;
      case "commitActivity":
        ctx.status = 400;
        ctx.body = result.error;
        logger.info("invalid attempt to submit activity, error: ", result.error);
        break;
      case "submitActivity":
        ctx.status = 422;
        ctx.body = result.error;
        break;
      default:
        ctx.status = 500;
        ctx.body = result.error;
        break;
    }
  }

  return next();
};

module.exports = {
  fetchAvailableActivitiesForActor,
  fetchAvailableActivitiesForActorReduced,
  fetchDoneActivitiesForActor,
  fetchActivityByActivityManagerId,
  fetchActivity,
  commitActivity,
  pushActivity,
  submitByActivityManagerId,
  commitByActivityManagerId,
};
