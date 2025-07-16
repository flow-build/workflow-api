import { envs } from "../config/env"
import { publishMessage } from "../services/broker"

import "../types/express"
import { utils as engineUtils } from "@flowbuild/engine"
import type { Request, Response } from "express"

export async function sendBeacon(req: Request, res: Response): Promise<void> {
  console.log("sendBeacon called")
  const actorId = req.state?.actor_data?.actor_id || ""
  const token = req.body?.token || ""

  if (actorId) {
    const payload = {
      timestamp: Date.now(),
      engine_id: engineUtils.ENGINE_ID,
      mqtt_host: envs.MQTT.HOST,
      flowbuild_host: envs.FLOWBUILD.URL,
      token
    }

    const emittedTo: string[] = []
    if (envs.MQTT) {
      const mqtt_namespace = envs.MQTT.NAMESPACE
      const mqttTopic = mqtt_namespace
        ? `/${mqtt_namespace}/beacon/${actorId}`
        : `/beacon/${actorId}`
      await publishMessage({ topic: mqttTopic, message: payload }, "MQTT")
      emittedTo.push("MQTT")
    }

    if (envs.KAFKA) {
      const kafka_namespace = envs.KAFKA.NAMESPACE
      const kafkaTopic = kafka_namespace
        ? `${kafka_namespace}.beacon`
        : `beacon`
      await publishMessage({ context: { topic: kafkaTopic, message: payload } }, "KAFKA")
      emittedTo.push("KAFKA")
    }

    if (envs.MQ.ENABLED) {
      await publishMessage({ context: { message: payload } }, "AMQP")
      emittedTo.push("AMQP")
    }

    if (!emittedTo.length) {
      res.status(500).json({ message: `No broker is enable on Flowbuild Server` })
      return
    }
    res.status(200).json({ message: `emitted message to ${emittedTo}` })
    return
  }
  res.status(400).json({ message: `invalid actor_id` })
  return
}
