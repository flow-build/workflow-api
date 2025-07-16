import { envs } from "../../config/env"
import { logger } from "../../utils/logger"

import { Kafka, type Mechanism, type Producer, type SASLOptions } from "kafkajs"

const sasl: SASLOptions | Mechanism = {
  mechanism: "plain",
  username: envs.KAFKA.API_KEY,
  password: envs.KAFKA.API_SECRET
}

const ssl = !!sasl

let client: Producer
export async function connect(): Promise<void> {
  try {
    logger.info("trying to connect to Kafka")
    const kafka = new Kafka({
      clientId: "flowbuild",
      brokers: [envs.KAFKA.BOOTSTRAP_SERVER],
      ssl,
      sasl
    })
    client = kafka.producer()
    await client.connect()
  }
  catch (error) {
    logger.error(error)
  }
}

type KafkaMessageInput = {
  topic: string
  message: string
  key: string
}

export async function publishMessage(input: KafkaMessageInput): Promise<void> {
  logger.info(`[services broker kafka] publishMessage to topic ${input.topic}`)
  if (!client) {
    logger.warn("[services broker kafka] No client")
    return
  }

  const messageBuf = Buffer.from(JSON.stringify(input.message))
  await client.send({
    topic: input.topic,
    messages: [
      {
        key: input.key,
        value: messageBuf,
        timestamp: Date.now().toString()
      }
    ]
  })
}

export function getClient(): Producer {
  return client
}

export async function disconnect(): Promise<void> {
  if (client) {
    await client.disconnect()
  }
}
