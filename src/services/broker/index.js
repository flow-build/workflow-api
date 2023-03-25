require("dotenv").config();
const mqtt = require("./mqtt");
const rabbitMQ = require("./rabbitMQ");
const kafka = require('./kafka');

async function connect() {
  if (process.env.MQTT === "true") {
    await mqtt.connect();
  }
  if (process.env.AMQP === "true") {
    await rabbitMQ.connect();
  }
  if (process.env.KAFKA === "true") {
    await kafka.connect();
  }
}

async function publishMessage(payload, broker) {
  if (process.env.MQTT === "true" && broker === "MQTT") {
    await mqtt.publishMessage(payload.topic, payload.message);
  } else if (process.env.AMQP === "true" && broker === "AMQP") {
    await rabbitMQ.publishMessage(payload.context);
  } else if (process.env.KAFKA === "true" && broker === "KAFKA") {
    await kafka.publishMessage(payload.context);
  }
}

module.exports = {
  connect,
  publishMessage,
}