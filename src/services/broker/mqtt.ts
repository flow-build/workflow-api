import { envs } from "../../config/env"
import { logger } from "../../utils/logger"

import mqtt, { type AsyncMqttClient } from "async-mqtt"
import { nanoid } from "nanoid"

let client: AsyncMqttClient
export async function connect(): Promise<void> {
  try {
    logger.info("[services broker mqtt] connect to MQTT Broker")
    const clientId = `flowBuild_${nanoid(10)}`

    logger.info(`[services broker mqtt] host: ${envs.MQTT.HOST}, client: ${clientId}, protocol: ${process.env.MQTT_PROTOCOL}`)

    client = mqtt.connect({
      hostname: envs.MQTT.HOST,
      port: envs.MQTT.PORT,
      protocol: envs.MQTT.PROTOCOL,
      path: envs.MQTT.PATH,
      clientId: clientId,
      username: envs.MQTT.USERNAME,
      password: envs.MQTT.PASSWORD
    })

    logger.info("[services broker mqtt] connected to MQTT Broker")
  }
  catch (error) {
    logger.error(error)
  }
}

type MqttMessageInput = {
  topic: string
  message: string
}

export async function publishMessage(input: MqttMessageInput): Promise<void> {
  logger.info(`[services broker mqtt] called publishMessage, topic: ${input.topic}`)
  if (client) {
    await client.publish(input.topic, JSON.stringify(input.message), { qos: 1 })
    logger.verbose(`[services broker mqtt] message published`)
  }
  else {
    logger.warn("[services broker mqtt] No client")
  }
}

export function getClient(): AsyncMqttClient {
  return client
}
