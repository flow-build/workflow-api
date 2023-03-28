require("dotenv").config();
const { Kafka } = require("kafkajs");
const { logger } = require("../../utils/logger");

const sasl = {
  mechanism: "plain",
  username: process.env.KAFKA_CLUSTER_API_KEY,
  password: process.env.KAFKA_API_SECRET,
};

const ssl = !!sasl;

let client;
async function connect() {
  try {
    logger.info("trying to connect to Kafka");
    const kafka = new Kafka({
      clientID: "flowbuild",
      brokers: [process.env.KAFKA_BOOTSTRAP_SERVER],
      ssl,
      sasl,
    });
    client = kafka.producer();
    await client.connect();
  } catch (error) {
    logger.error(error);
  }
}

async function publishMessage({ topic, message, key }) {
  logger.info(`[kafka] publishing message to topic ${topic}`);
  if (!client) {
    logger.info("[kafka] No client");
    return undefined;
  }
  const messageBuf = Buffer.from(JSON.stringify(message));
  const result = await client.send({
    topic,
    messages: [
      {
        key,
        value: messageBuf,
        timestamp: Date.now(),
      },
    ],
  });
  //const result = await client.produce(topic, -1, messageBuf, key, Date.now())
  return result;
}

function getClient() {
  return client;
}

async function disconnect() {
  if (client._isConnected) {
    await client.die();
  }
}

module.exports = {
  getClient,
  publishMessage: publishMessage,
  connect: connect,
  disconnect,
};
