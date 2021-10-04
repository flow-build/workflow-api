require("dotenv").config();
const { logger } = require("./logger");
const mqtt = require("../services/mqtt");

const processStateListener = async (processState) => {
  logger.info(`PS LISTENER STARTED FOR PROCESS: ${processState.id}`);
};

const activityManagerListener = async (activityManager) => {
  logger.info(`AM LISTENER STARTED FOR PROCESS: ${activityManager._process_id}`);

  const topic = `/process/${activityManager._process_id}/am/create`;

  const message = {
    processId: activityManager._process_id,
    activityManagerId: activityManager._id,
    status: activityManager._status,
  };

  mqtt.publishMessage(topic, message);
};

const activateNotifiers = (engine) => {
  engine.setProcessStateNotifier(processStateListener);
  engine.setActivityManagerNotifier(activityManagerListener);
};

module.exports = {
  activateNotifiers,
};
