import { createJWTToken } from "../services/tokenGenerator"
import { jwtSecret } from "../utils/jwtSecret"
import { logger } from "../utils/logger"

import "../types/express"
import type { Request, Response } from "express"
import { nanoid } from "nanoid"
import { v1 as uuid } from "uuid"

export async function get(req: Request, res: Response): Promise<void> {
  logger.info("[controllers token] callet get")
  const secret = req.get("x-secret") || jwtSecret
  const duration = parseInt(req.get("x-duration") ?? "3600")

  const body = req.body || {}
  if (!body?.actor_id) {
    body.actor_id = uuid()
    logger.debug("[controllers token] set a random actor_id")
  }
  if (!body?.claims) {
    body.claims = []
    logger.debug("[controllers token] set an empty claims list")
  }
  else if (!Array.isArray(body.claims)) {
    const claims = []
    claims.push(body.claims)
    body.claims = claims
  }

  body.session_id = nanoid()

  const jwtToken = createJWTToken({ payload: body, secret: secret.toString(), duration })
  res.status(200).send({
    jwtToken,
    payload: body
  })
};
