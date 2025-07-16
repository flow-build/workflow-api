import { envs } from "../config/env"
import { logger } from "../utils/logger"

import "../types/express"
import type { NextFunction, Response } from "express"
import { Request } from "express-jwt"
import { get } from "lodash"

const customMap = {
  actor_id: envs.JWT.PATH.ACTOR_ID,
  claims: envs.JWT.PATH.CLAIMS,
  session_id: envs.JWT.PATH.SESSION_ID
}

export async function captureActorData(req: Request, res: Response, next: NextFunction) {
  logger.debug("[middleware actorData] captureActorData")
  if (!req.auth) {
    logger.debug("empty token payload")
    res.status(401).send({ message: "User data not found" })
    return
  }

  const defaultData = mapDefaultData(req)

  if (!defaultData.actorId) {
    logger.debug("no actor_id")
    res.status(401).send({ message: "Actor id not found" })
    return
  }

  if (!Array.isArray(defaultData.claims)) {
    logger.debug("invalid claims")
    res.status(401).send({ message: "Invalid claims" })
    return
  }

  if (req.actorData) {
    req.actorData["actorId"] = defaultData.actorId
    req.actorData["claims"] = defaultData.claims
    req.actorData.trace = defaultData.trace
    req.actorData["sessionId"] = defaultData.sessionId
  }
  else {
    req.actorData = defaultData
  }

  req.actorData.extData = mapExtraData(req.auth)

  return next()
};

function mapDefaultData(req: Request) {
  const actorId = get(req.auth, customMap.actor_id)
  const claims = get(req.auth, customMap.claims)
  const sessionId = get(req.auth, customMap.session_id)
  const trace = {
    tracestate: req.headers.tracestate,
    traceparent: req.headers.traceparent
  }

  return { actorId, claims, sessionId, trace }
};

function mapExtraData(user: Record<string, any>) {
  let keys
  if (!envs.JWT.EXTRA_KEYS || envs.JWT.EXTRA_KEYS.length === 0) {
    const allkeys = Object.keys(user)
    const defaultKeys = Object.values(customMap)
    keys = allkeys.filter(key => !defaultKeys.includes(key))
  }
  else {
    keys = envs.JWT.EXTRA_KEYS
  }

  const extData: Record<string, any> = {}
  if (keys && keys.length > 0) {
    for (const key of keys) {
      if (user[key]) {
        extData[key] = user[key]
      }
    }
  }

  return extData
};
