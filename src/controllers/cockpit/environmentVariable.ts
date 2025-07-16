import { getCockpit } from "../../engine"
import { logger } from "../../utils/logger"

import "../../types/express"
import type { NextFunction, Request, Response } from "express"

function serializeEnv(env: any) {
  const variable: any = {
    key: env.key,
    value: env.value,
    type: env.type,
    origin: env._origin
  }
  if (env?._origin !== "environment") {
    variable.created_at = env.created_at
    variable.updated_at = env._updated_at
  }
  return variable
}

export async function saveEnvironmentVariable(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("called saveEnvironmentVariable")
  const { key, value } = req.body
  const cockpit = getCockpit()
  try {
    const existingEnvironmentVariable = await cockpit.fetchEnvironmentVariable(key)
    let environmentVariable
    if (!existingEnvironmentVariable || existingEnvironmentVariable._origin === "environment") {
      logger.debug("Environment Variable Created")
      environmentVariable = await cockpit.createEnvironmentVariable(key, value)
      res.status(201)
    }
    else {
      logger.debug("Environment Variable Updated")
      environmentVariable = await cockpit.updateEnvironmentVariable(key, value)
      res.status(200)
    }
    res.json(serializeEnv(environmentVariable))
  }
  catch (err: any) {
    res.status(500).json({ message: `Failed at ${err.message}`, error: err })
  }
  return next()
}

export async function getEnvironmentVariables(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("called getEnvironmentVariables")
  const cockpit = getCockpit()
  try {
    const environmentVariables = await cockpit.fetchAllEnvironmentVariables()
    res.status(200).json(environmentVariables.map((env: any) => serializeEnv(env)))
  }
  catch (err: any) {
    res.status(500).json({ message: `Failed at ${err.message}`, error: err })
  }
  return next()
}

export async function getEnvironmentVariable(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("called getEnvironmentVariable")
  const { key } = req.params
  const cockpit = getCockpit()
  try {
    const environmentVariable = await cockpit.fetchEnvironmentVariable(key)
    if (environmentVariable) {
      res.status(200).json(serializeEnv(environmentVariable))
    }
    else {
      res.status(404).json({ message: "Environment variable not found" })
    }
  }
  catch (err: any) {
    res.status(500).json({ message: `Failed at ${err.message}`, error: err })
  }
  return next()
}

export async function deleteEnvironmentVariable(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("called deleteEnvironmentVariable")
  const { key } = req.params
  const cockpit = getCockpit()
  try {
    const environmentVariable = await cockpit.fetchEnvironmentVariable(key)
    if (!environmentVariable) {
      res.status(404).json({ message: "Environment variable not found" })
    }
    else {
      await cockpit.deleteEnvironmentVariable(key)
      res.status(204).send()
    }
  }
  catch (err: any) {
    res.status(500).json({ message: `Failed at ${err.message}`, error: err })
  }
  return next()
}
