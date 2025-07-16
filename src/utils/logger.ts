import { envs } from "../config/env"

import { createLogger, format, transports } from "winston"

export const logger = createLogger({
  level: envs.LOG_LEVEL || "info",
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.label({ label: "API", message: true }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [new transports.Console()],
  exceptionHandlers: [
    new transports.Console({
      format: format.errors()
    })
  ],
  rejectionHandlers: [new transports.Console()]
})
