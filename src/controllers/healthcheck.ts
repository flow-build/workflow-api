import pkg from "../../package.json"
import { envs } from "../config/env"
import { getCockpit, getEngine } from "../engine"
import { getClient } from "../services/broker"
import { logger } from "../utils/logger"

import "../types/express"
import type { NextFunction, Request, Response } from "express"

export async function healthcheck(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("[controllers healthcheck] called healthcheck")

  const engine = getEngine()
  const cockpit = getCockpit()
  const brokerClient = getClient()

  const expiredTimers = await cockpit.fetchTimersReady()
  const activeTimers = await cockpit.fetchTimersActive()

  let rabbitMQ, broker = undefined
  if (envs.MQ.ENABLED) {
    rabbitMQ = {
      status: true,
      hostname: envs.MQ.HOST,
      queue: envs.MQ.QUEUE
    }

    broker = {
      activityManager: envs.FLOWBUILD.ACTIVITY_MANAGER.BROKER,
      processState: envs.FLOWBUILD.PROCESS_STATE.BROKER,
      engineLogs: envs.FLOWBUILD.LOGS.BROKER
    }
  }

  const body = {
    "message": "Flowbuild API is fine!",
    "version": pkg.version,
    "engine": {
      version: pkg.dependencies["@flowbuild/engine"],
      latestEvent: engine.emitter.event
    },
    "timers": {
      batch: envs.TIMERS.BATCH,
      queue: envs.TIMERS.QUEUE,
      ready: envs.TIMERS.BATCH === 0 ? expiredTimers.length : "engine timer processing disabled",
      active: activeTimers.length
    },
    "diagram-builder": pkg.dependencies["@flowbuild/nodejs-diagram-builder"],
    "indexer": pkg.dependencies["@flowbuild/indexer"],
    "mqtt": {
      status: envs.MQTT.ENABLED,
      hostname: (brokerClient as any)?.options?.hostname,
      protocol: (brokerClient as any)?.options?.protocol,
      client: (brokerClient as any)?.options?.clientId
    },
    rabbitMQ,
    "configuration": {
      logLevels: {
        engine: process.env.ENGINE_LOG_LEVEL,
        server: process.env.KOA_LOG_LEVEL,
        pushStateEvents: process.env.PUBLISH_STATE_EVENTS,
        pushEngineLogs: process.env.PUBLISH_ENGINE_LOGS,
        pushServerLogs: process.env.PUBLISH_SERVER_LOGS
      },
      engine: {
        heartbeat: process.env.ENGINE_HEARTBEAT,
        maxStepNumber: process.env.MAX_STEP_NUMBER
      },
      httpNodes: {
        maxLength: process.env.MAX_CONTENT_LENGTH,
        timeout: process.env.HTTP_TIMEOUT,
        maxBody: process.env.MAX_BODY_LENGTH
      },
      OpenTelemetry: {
        status: process.env.OTEL_ENABLED === "true" ? "enabled" : "disabled",
        serviceName: process.env.OTEL_SERVICE_NAME,
        newRelic: process.env.NEW_RELIC_ENABLED === "true" ? "active" : "inactive",
        collector: process.env.OTEL_COLLECTOR_URL
      },
      broker
    }
  }

  if (envs.FLOWBUILD.MAX_READY_TIMERS && expiredTimers.length > envs.FLOWBUILD.MAX_READY_TIMERS) {
    res.status(409).send(body)
    return next()
  }

  res.status(200)
};
