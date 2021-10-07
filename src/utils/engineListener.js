require("dotenv").config();
const { logger } = require("./logger");
const mqtt = require("../services/mqtt");

const processStateListener = async (processState) => {
  logger.info(`PS LISTENER: PID [${processState.id}]`);
};

const activityManagerListener = async (activityManager) => {
  logger.info(`AM LISTENER: AMID [${activityManager._id}]`);

  const topic = `/process/${activityManager._process_id}/am/create`;

  const message = {
    process_id: activityManager._process_id,
    id: activityManager._id,
    status: activityManager._status,
    props: activityManager._props,
  };

  mqtt.publishMessage(topic, message);

  if (activityManager._props.result.session_id) {
    const sessionTopic = `/session/${activityManager._props.result.session_id}/am/create`;
    mqtt.publishMessage(sessionTopic, message);
  } else {
    logger.info("AM LISTENER: No session provided");
  }

  if (activityManager._props.result.actor_id) {
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
