require("dotenv").config();
const mqtt = require("async-mqtt");
const { nanoid } = require("nanoid");
const { logger } = require("../utils/logger");

let client;
async function connect() {
  try {
    logger.info("trying to connect to MQTT Broker");
    const clientId = `flowBuild_${nanoid(10)}`;

    logger.info(`[mqtt] HOST: ${process.env.MQTT_HOST}, client: ${clientId}`);

    client = mqtt.connect({
      hostname: process.env.MQTT_HOST,
      port: process.env.MQTT_PORT,
      protocol: process.env.MQTT_PROTOCOL || "ws",
      path: process.env.MQTT_PATH || "/mqtt",
      clientId: clientId,
    });

    logger.info("[mqtt] connected to MQTT Broker");
  } catch (error) {
    logger.error(error);
  }
}

async function publishMessage(topic, message) {
  let response;
  if (process.env.MQTT === "true") {
    logger.silly(`[mqtt] publishing message to topic ${topic}`);
    if (client) {
      response = await client.publish(topic, JSON.stringify(message), { qos: 1 });
      logger.debug(`[mqtt] Broker messageId: ${response.messageId} on topic ${topic}`);
    } else {
      logger.info("[mqtt] No client");
    }
  }
  return response;
}

function getClient() { 
  return client;
}

module.exports = {
  getClient,
  publishMessage: publishMessage,
  connect: connect,
};
