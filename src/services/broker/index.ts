import { envs } from "../../config/env"

import * as kafka from "./kafka"
import * as mqtt from "./mqtt"
import * as rabbitMQ from "./rabbitMQ"

export async function connect() {
  if (process.env.MQTT === "true") {
    await mqtt.connect()
  }
  if (process.env.AMQP === "true") {
    await rabbitMQ.connect()
  }
  if (process.env.KAFKA === "true") {
    await kafka.connect()
  }
}

export async function publishMessage(payload: Record<string, any>, broker: string) {
  if (envs.FLOWBUILD.EVENTS.BROKER === "MQTT") {
    await mqtt.publishMessage({ topic: payload.topic, message: payload.message })
  }
  else if (process.env.AMQP === "true" && broker === "AMQP") {
    await rabbitMQ.publishMessage(payload.context)
  }
  else if (process.env.KAFKA === "true" && broker === "KAFKA") {
    await kafka.publishMessage(payload.context)
  }
}

export function getClient() {
  if (envs.FLOWBUILD.EVENTS.BROKER === "MQTT") {
    return mqtt.getClient()
  }
  else if (envs.MQ.ENABLED && envs.FLOWBUILD.EVENTS.BROKER === "AMQP") {
    return rabbitMQ.getClient()
  }
  else if (envs.KAFKA && envs.FLOWBUILD.EVENTS.BROKER === "KAFKA") {
    return kafka.getClient()
  }
}
