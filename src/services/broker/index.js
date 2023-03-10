require("dotenv").config();
const mqtt = require("./mqtt");
const rabbitMQ = require("./rabbitMQ");
const { MQTT, AMQP } = process.env;

async function connect() {
  if (MQTT === "true") {
    mqtt.connect();
  }
  if (AMQP === "true") {
    rabbitMQ.connect();
  }
}

async function publishMessage(payload, broker) {
  if (MQTT === "true" && broker === "MQTT") {
    mqtt.publishMessage(payload.topic, payload.message);
  } else if (AMQP === "true" && broker === "AMQP") {
    rabbitMQ.publishMessage(payload.context);
  }
}

module.exports = {
  connect,
  publishMessage,
}