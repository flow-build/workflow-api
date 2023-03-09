require("dotenv").config();
const amqp = require("amqplib");
const { logger } = require("../utils/logger");
const { AMQP, BROKER_PASSWORD, BROKER_USERNAME, BROKER_HOST, BROKER_QUEUE } = process.env;

let channel;
async function connect() {
  try {
    logger.info("trying to connect no RABBITMQ Broker");
    logger.info(`[rabbitMQ] HOST: ${BROKER_HOST}`);
    const conn = await amqp.connect(`amqp://${BROKER_USERNAME}:${BROKER_PASSWORD}@${BROKER_HOST}`);

    await createQueue(conn)

    channel = await conn.createChannel();

    logger.info('[rabbitMQ] connected to RABBITMQ Broker');
  } catch (error) {
    logger.error(`[rabbitMQ] Error at RABBITMQ connect ${JSON.stringify(error)}`);
  }
}

async function publishMessage(queue, message) {
  logger.info('[rabbitMQ] Called publishMessage');
  let response
  if (channel && AMQP === "true") {
    logger.info(`[rabbitMQ] publishing message to queue ${queue}`);
    await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    logger.verbose(`[rabbitMQ] Broker message on queue ${queue}`);
  } else {
    logger.info("[rabbitMQ] No channel");
  }
  return response;
}

async function createQueue(conn) {
  const channelCreated = await conn.createChannel();

  await channelCreated.assertQueue(BROKER_QUEUE, {
    durable: true,
    arguments: {
      'x-queue-type': 'classic',
    },
  });
}

module.exports = {
  publishMessage,
  connect,
}