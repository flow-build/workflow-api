require("dotenv").config();
const mqtt = require("./mqtt");
const rabbitMQ = require("./rabbitMQ");

async function connect() {
  if (process.env.MQTT === "true") {
    await mqtt.connect();
  }
  if (process.env.AMQP === "true") {
    await rabbitMQ.connect();
  }
}

async function publishMessage(payload, broker) {
  if (process.env.MQTT === "true" && broker === "MQTT") {
    await mqtt.publishMessage(payload.topic, payload.message);
  } else if (process.env.AMQP === "true" && broker === "AMQP") {
    await rabbitMQ.publishMessage(payload.context);
  }
}

module.exports = {
  connect,
  publishMessage,
}