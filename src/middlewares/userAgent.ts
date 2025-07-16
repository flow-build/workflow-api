import { logger } from "../utils/logger"

import "../types/express"
import RequestIp from "@supercharge/request-ip"
import type { NextFunction, Request, Response } from "express"
import useragent from "useragent"

export async function captureUserAgentAndIp(req: Request, res: Response, next: NextFunction) {
  logger.debug("[middleware userAgent] captureUserAgentAndIp")
  const ip = RequestIp.getClientIp(req)
  const userAgentHeader = Array.isArray(req.headers["user-agent"])
    ? req.headers["user-agent"][0]
    : req.headers["user-agent"]
  const _userAgent = useragent.parse(userAgentHeader)
  const userAgent = {
    os: _userAgent.os.toString(),
    version: `${_userAgent.major}.${_userAgent.minor}`,
    family: _userAgent.family,
    device: _userAgent.device.toString()
  }

  if (req.actorData) {
    req.actorData.userAgent = userAgent
    req.actorData.ip = ip
  }
  else {
    req.actorData = {
      userAgent: userAgent,
      ip
    }
  }

  return next()
};
