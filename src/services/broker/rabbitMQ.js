require("dotenv").config();
const amqp = require("amqplib");
const { logger } = require("../../utils/logger");
const { BROKER_PASSWORD, BROKER_USERNAME, BROKER_HOST, BROKER_QUEUE } = process.env;

let channel;
async function connect() {
  try {
    logger.info("trying to connect no RABBITMQ Broker");
    logger.info(`[rabbitMQ] HOST: ${BROKER_HOST}`);
    const conn = await amqp.connect(`amqp://${BROKER_USERNAME}:${BROKER_PASSWORD}@${BROKER_HOST}`);

    await createQueue(conn);

    channel = await conn.createChannel();

    logger.info('[rabbitMQ] connected to RABBITMQ Broker');
  } catch (error) {
    logger.error(`[rabbitMQ] Error at RABBITMQ connect ${JSON.stringify(error)}`);
  }
}

async function publishMessage(content) {
  logger.info('[rabbitMQ] Called publishMessage');
  const message = {
    input: {
      activityManagerId: content?._id,
      processId: content?._process_id,
      ...content?._props?.result,
    },
    action: content?._props?.action,
    schema: content?._parameters,
  };

  if (channel) {
    logger.info(`[rabbitMQ] publishing message to queue ${BROKER_QUEUE}`);
    await channel.sendToQueue(BROKER_QUEUE, Buffer.from(JSON.stringify(message)));
    logger.verbose(`[rabbitMQ] Broker message on queue ${BROKER_QUEUE}`);
  } else {
    logger.info("[rabbitMQ] No channel to publish message");
  }
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