require("dotenv").config();
const { logger } = require("./logger");
const namespace = process.env.MQTT_NAMESPACE;
const broker = require("../services/broker/index");
const { Tree } = require("@flowbuild/process-tree");
const { db } = require('./db')
const tree = new Tree(db);
const { ACTIVITY_MANAGER_BROKER, PROCESS_STATE_BROKER } = process.env;

const processStateListener = async (processState) => {

  if(processState.step_number === 1) {
    const processId = processState.process_id;
    const parentId = processState.bag.parent_process_data?.id || processState.actor_data.parentProcessData?.id;
    if(parentId) {
      logger.debug(`PS LISTENER: Process Tree, appendChild PID ${processId}`)
      await tree.appendChild({ parentId, processId })
    } else {
      logger.debug(`PS LISTENER: Process Tree, create tree PID ${processId}`)
      await tree.createTree(processId)
    }
  }

  if(process.env.PUBLISH_STATE_EVENTS) {
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
  
    broker.publishMessage({ topic, message }, PROCESS_STATE_BROKER);
    logger.info(`PS LISTENER: PID [${processState.process_id}] SID [${processState.id}], step [${processState.step_number}], status [${processState.status}]`);
  }
};

const activityManagerListener = async (activityManager) => {
  logger.info(`AM LISTENER: AMID [${activityManager._id}]`);
  if (!activityManager._id) {
    return
  }

  const topic = (namespace) ? `/${namespace}/process/${activityManager._process_id}/am/create` : `/process/${activityManager._process_id}/am/create`;

  const message = {
    process_id: activityManager._process_id,
    id: activityManager._id,
    status: activityManager._status,
    props: activityManager._props,
  };

  broker.publishMessage({ topic, message, context: activityManager }, ACTIVITY_MANAGER_BROKER);

  if (activityManager?._props?.result?.session_id) {
    const sessionTopic = (namespace) ? `/${namespace}/session/${activityManager._props.result.session_id}/am/create` : `/session/${activityManager._props.result.session_id}/am/create`;
    broker.publishMessage({ sessionTopic, message, activityManager }, ACTIVITY_MANAGER_BROKER);
  } else {
    logger.info("AM LISTENER: No session provided");
  }

  if (activityManager?._props?.result?.actor_id) {
    const actorTopic = (namespace) ? `/${namespace}/actor/${activityManager._props.result.actor_id}/am/create` : `/actor/${activityManager._props.result.actor_id}/am/create`;
    broker.publishMessage({ actorTopic, message, activityManager }, ACTIVITY_MANAGER_BROKER);
  } else {
    logger.info("AM LISTENER: No actor provided");
  }
}

const activateNotifiers = (engine) => {
  engine.setProcessStateNotifier(processStateListener);
  engine.setActivityManagerNotifier(activityManagerListener); 
};

module.exports = {
  activateNotifiers,
};
