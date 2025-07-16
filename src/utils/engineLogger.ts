import { envs } from "../config/env"
import { getEngine } from "../engine"
import * as broker from "../services/broker"

import { createLogger, format, transports } from "winston"

const engine = getEngine()

export const engineLogger = createLogger({
  transports: [
    new transports.Console({
      level: envs.FLOWBUILD.LOGS.LOG_LEVEL,
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.label({ label: "ENGINE", message: true }),
        format.align(),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
      )
    })
  ]
})

export function startLogger() {
  engineLogger.info("startLogger")

  let logLevel: "verbose" | "warn" | "info" | "silly" | "debug" = "silly"
  let logMessage

  if (envs.FLOWBUILD.LOGS.BROKER) {
    engine.emitter.onAny(function (event: any, message: any, variables: any) {
      const topic = `/logs`
      const msg = {
        event,
        message,
        variables,
        timestamp: new Date()
      }

      broker.publishMessage({ topic, message: msg }, envs.FLOWBUILD.LOGS.BROKER)
    })
  }

  engine.emitter.on("PROCESS.START_NODE_RUN", (message: any) => {
    logLevel = "verbose"
    logMessage = message
    engineLogger[logLevel](logMessage)
  })

  engine.emitter.on("EXECUTION_LOOP.ROLLBACK", (message: any) => {
    logLevel = "warn"
    logMessage = message
    engineLogger[logLevel](logMessage)
  })

  engine.emitter.on("ENGINE.CONTRUCTOR", (message: any) => {
    logLevel = "warn"
    logMessage = message
    engineLogger[logLevel](logMessage)
  })
};
