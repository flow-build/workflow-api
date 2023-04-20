require("dotenv").config();
const { logger } = require("./logger");
const namespace = process.env.MQTT_NAMESPACE;
const broker = require("../services/broker/index");
const { Tree } = require("@flowbuild/process-tree");
const { db } = require("./db");
const tree = new Tree(db);

const processStateListener = async (processState) => {

  if (processState.step_number === 1) {
    const processId = processState.process_id;
    const parentId = processState.bag.parent_process_data?.id || processState.actor_data.parentProcessData?.id;
    if (parentId) {
      logger.debug(`PS LISTENER: Process Tree, appendChild PID ${processId}`)
      await tree.appendChild({ parentId, processId })
    } else {
      logger.debug(`PS LISTENER: Process Tree, create tree PID ${processId}`)
      await tree.createTree(processId)
    }
  }

  if (process.env.PUBLISH_STATE_EVENTS) {
    const topic = (namespace) ? `/${namespace}/process/${processState.process_id}/state` : `/process/${processState.process_id}/state`;

    const message = {
      stateId: processState.id,
      processId: processState.process_id,
      stepNumber: processState.step_number,
      nodeId: processState.node_id,
      status: processState.status,
      workflow: processState.workflow_name,
      result: processState.result
    };

    broker.publishMessage({ topic, message }, process.env.PROCESS_STATE_BROKER || "MQTT");
    logger.info(`PS LISTENER: PID [${processState.process_id}] SID [${processState.id}], step [${processState.step_number}], status [${processState.status}]`);
  }
};

const activityManagerListener = async (activityManager) => {
  logger.info(`AM LISTENER: AMID [${activityManager._id}]`);
  const skipListener = (
    process.env.ACTIVITY_MANAGER_SEND_ONLY_ON_CREATION === "true"
    && (activityManager._activities?.length > 0 || activityManager._status !== "started")
  );

  if (!activityManager._id || skipListener) {
    return
  }

  let topic = (namespace) ? `/${namespace}/process/${activityManager._process_id}/am/create` : `/process/${activityManager._process_id}/am/create`;

  const message = {
    process_id: activityManager._process_id,
    id: activityManager._id,
    status: activityManager._status,
    props: activityManager._props,
  };

  broker.publishMessage({ topic, message, context: activityManager }, process.env.ACTIVITY_MANAGER_BROKER || "MQTT");

  if (activityManager?._props?.result?.session_id) {
    topic = (namespace) ? `/${namespace}/session/${activityManager._props.result.session_id}/am/create` : `/session/${activityManager._props.result.session_id}/am/create`;
    broker.publishMessage({ topic, message, activityManager }, process.env.ACTIVITY_MANAGER_BROKER || "MQTT");
  } else {
    logger.info("AM LISTENER: No session provided");
  }

  if (activityManager?._props?.result?.actor_id) {
    topic = (namespace) ? `/${namespace}/actor/${activityManager._props.result.actor_id}/am/create` : `/actor/${activityManager._props.result.actor_id}/am/create`;
    broker.publishMessage({ topic, message, activityManager }, process.env.ACTIVITY_MANAGER_BROKER || "MQTT");
  } else {
    logger.info("AM LISTENER: No actor provided");
  }
}

const eventNodeNotifier = async (eventData) => {
  const namespace = process.env.WORKFLOW_EVENTS_NAMESPACE || process.env.NODE_ENV;
  const { event, execution_data } = eventData
  if (event.family === 'target') {
    await broker.publishMessage({
      context: {
        topic: `${namespace ? `${namespace}.` : ''}wem.process.target.create`,
        message: {
          event,
          execution_data
        }
      }
    }, process.env.WORKFLOW_EVENTS_BROKER || "KAFKA")
  }
}

const activateNotifiers = (engine) => {
  engine.setProcessStateNotifier(processStateListener);
  engine.setActivityManagerNotifier(activityManagerListener);
  engine.setEventNodeNotifier(eventNodeNotifier);
};

module.exports = {
  activateNotifiers,
};
