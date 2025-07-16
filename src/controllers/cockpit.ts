import { getCockpit } from "../engine"
import { logger } from "../utils/logger"

import "../types/express"
import type { NextFunction, Request, Response } from "express"

export async function fetchWorkflowsWithProcessStatusCount(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("[KW] Called fetchWorkflowsWithProcessStatusCount")
  const cockpit = getCockpit()
  const filters = req.query
  const workflows = await cockpit.fetchWorkflowsWithProcessStatusCount(filters)
  res.status(200).json({ workflows })
  return next()
}

export async function setProcessState(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("[KW] Called setProcessState")
  const cockpit = getCockpit()
  const process_id = req.params.id
  const state_data = req.body
  const result = await cockpit.setProcessState(process_id, state_data)
  res.status(200).json(result.serialize())
  return next()
}

export async function runPendingProcess(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("[KW] Called runPendingProcess")
  const cockpit = getCockpit()
  const process_id = req.params.id
  const actor_data = req.body
  await cockpit.runPendingProcess(process_id, actor_data)
  res.status(202).send()
  return next()
}
