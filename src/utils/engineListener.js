require("dotenv").config();
const { logger } = require("./logger");
const mqtt = require("../services/mqtt");

const processStateListener = async (processState) => {
  if(process.env.PUBLISH_STATE_EVENTS) {
    const topic = `/process/${processState.process_id}/state`;

    const message = {
      stateId: processState.id,
      processId: processState.process_id,
      stepNumber: processState.step_number,
      nodeId: processState.node_id,
      status: processState.status,
      workflow: processState.workflow_name,
      result: processState.result
    };
  
    mqtt.publishMessage(topic, message);
    logger.info(`PS LISTENER: PID [${processState.process_id}] SID [${processState.id}], step [${processState.step_number}], status [${processState.status}]`);
  }
};

const activityManagerListener = async (activityManager) => {
  logger.info(`AM LISTENER: AMID [${activityManager._id}]`);
  if (!activityManager._id) {
    return
  }

  const topic = `/process/${activityManager._process_id}/am/create`;

  const message = {
    process_id: activityManager._process_id,
    id: activityManager._id,
    status: activityManager._status,
    props: activityManager._props,
  };

  mqtt.publishMessage(topic, message);

  if (activityManager?._props?.result?.session_id) {
    const sessionTopic = `/session/${activityManager._props.result.session_id}/am/create`;
    mqtt.publishMessage(sessionTopic, message);
  } else {
    logger.info("AM LISTENER: No session provided");
  }

  if (activityManager?._props?.result?.actor_id) {
    const actorTopic = `/actor/${activityManager._props.result.actor_id}/am/create`;
    mqtt.publishMessage(actorTopic, message);
  } else {
    logger.info("AM LISTENER: No actor provided");
  }
};

const activateNotifiers = (engine) => {
  engine.setProcessStateNotifier(processStateListener);
  engine.setActivityManagerNotifier(activityManagerListener);
};

module.exports = {
  activateNotifiers,
};
