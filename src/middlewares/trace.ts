import { logger } from "../utils/logger"

import "../types/express"
import type { NextFunction, Request, Response } from "express"
import traceparent from "traceparent"

export async function captureTraceData(req: Request, res: Response, next: NextFunction) {
  logger.debug("[middleware trace] captureTraceData")
  const tracesettings = { transactionSampleRate: 1 }

  let parent
  const traceparentHeader = req.headers?.traceparent
  if (traceparentHeader) {
    logger.silly("old traceparent: ", traceparentHeader)
    if (Array.isArray(traceparentHeader)) {
      parent = traceparent.fromString(traceparentHeader[0])
    }
    else {
      parent = traceparent.fromString(traceparentHeader)
    }
  }
  else {
    logger.silly("no traceparent: ")
  }

  const _traceparent = traceparent.startOrResume(parent, tracesettings)

  const trace = {
    tracestate: req.headers.tracestate,
    traceparent: _traceparent.toString()
  }

  if (req.actorData) {
    req.actorData.trace = trace
  }
  else {
    req.actorData = {
      trace: trace
    }
  }

  logger.silly("new traceparent: ", traceparent.toString())

  return next()
}
