import { envs } from "../config/env"

import { logger } from "./logger"

export const jwtSecret = setJwtSecret()

function setJwtSecret() {
  let jwtSecret: string | Buffer = envs.JWT.KEY

  if (envs.JWT.ALG === "RS256") {
    logger.info("using RS256, switching secretKey to certificate")
    const pemHeader = "-----BEGIN PUBLIC KEY-----"
    const pemFooter = "-----END PUBLIC KEY-----"
    const t0 = pemHeader + "\n" + envs.JWT.KEY + "\n" + pemFooter
    jwtSecret = Buffer.from(t0)
  }

  return jwtSecret
}

export const jwtAlgorithms = envs.JWT.ALG
export const jwtPassthrough = envs.JWT.PASSTHROUGH
