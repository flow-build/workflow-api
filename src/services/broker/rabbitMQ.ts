import { envs } from "../../config/env"
import { logger } from "../../utils/logger"

import amqp, { type Channel, ChannelModel } from "amqplib"

let channel: Channel
export async function connect(): Promise<void> {
  try {
    logger.info(`[services broker rabbitMQ] called connect HOST: ${envs.MQ.HOST}`)
    const conn = await amqp.connect(`amqp://${envs.MQ.USERNAME}:${envs.MQ.PASSWORD}@${envs.MQ.HOST}`)
    await createQueue(conn)
    channel = await conn.createChannel()
    logger.info("[services broker rabbitMQ] connected")
  }
  catch (error) {
    logger.error(`[services broker rabbitMQ] Error at connect ${JSON.stringify(error)}`)
  }
}

export async function publishMessage(content: any): Promise<void> {
  logger.info("[services broker rabbitMQ] called publishMessage")
  const message = {
    input: {
      activityManagerId: content?._id,
      processId: content?._process_id,
      ...content?._props?.result
    },
    action: content?._props?.action,
    schema: content?._parameters
  }

  if (channel) {
    channel.sendToQueue(envs.MQ.QUEUE, Buffer.from(JSON.stringify(message)))
    logger.info(`[services broker rabbitMQ] message sent`)
  }
  else {
    logger.warn("[services broker rabbitMQ] No channel to publish message")
  }
}

export function getClient() {
  return channel
}

export async function createQueue(conn: ChannelModel): Promise<void> {
  const channelCreated = await conn.createChannel()

  await channelCreated.assertQueue(envs.MQ.QUEUE, {
    durable: true,
    arguments: {
      "x-queue-type": "classic"
    }
  })
}
