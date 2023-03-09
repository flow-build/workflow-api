require("dotenv").config();
const { logger } = require("./logger");
const rabbitMQ = require("../services/rabbitMQ");
const queue = process.env.BROKER_QUEUE;
const mqtt = require("../services/mqtt");
const namespace = process.env.MQTT_NAMESPACE;
const { Tree } = require("@flowbuild/process-tree");
const { db } = require('./db')
const tree = new Tree(db);

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
  
    mqtt.publishMessage(topic, message);
    logger.info(`PS LISTENER: PID [${processState.process_id}] SID [${processState.id}], step [${processState.step_number}], status [${processState.status}]`);
  }
};

const activityManagerListener = async (activityManager) => {
  logger.info(`AM LISTENER: AMID [${activityManager._id}]`);
  if (!activityManager._id) {
    return
  }

  if (process.env.MQTT === "true") {
    const topic = (namespace) ? `/${namespace}/process/${activityManager._process_id}/am/create` : `/process/${activityManager._process_id}/am/create`;

    const message = {
      process_id: activityManager._process_id,
      id: activityManager._id,
      status: activityManager._status,
      props: activityManager._props,
    };

    mqtt.publishMessage(topic, message);

    if (activityManager?._props?.result?.session_id) {
      const sessionTopic = (namespace) ? `/${namespace}/session/${activityManager._props.result.session_id}/am/create` : `/session/${activityManager._props.result.session_id}/am/create`;
      mqtt.publishMessage(sessionTopic, message);
    } else {
      logger.info("AM LISTENER: No session provided");
    }

    if (activityManager?._props?.result?.actor_id) {
      const actorTopic = (namespace) ? `/${namespace}/actor/${activityManager._props.result.actor_id}/am/create` : `/actor/${activityManager._props.result.actor_id}/am/create`;
      mqtt.publishMessage(actorTopic, message);
    } else {
      logger.info("AM LISTENER: No actor provided");
    }
  } else if (process.env.AMQP === "true") {
    if (activityManager?._status == "started" && activityManager?._activities?.length === 0) {
      const payload = {
        input: {
          activityManagerId: activityManager?._id,
          processId: activityManager?._process_id,
          ...activityManager?._props?.result,
        },
        action: activityManager?._props?.action,
        schema: activityManager?._parameters,
      };
  
      rabbitMQ.publishMessage(queue, payload);
      return;
    }
  }
};

const activateNotifiers = (engine) => {
  engine.setProcessStateNotifier(processStateListener);
  engine.setActivityManagerNotifier(activityManagerListener);
};

module.exports = {
  activateNotifiers,
};
