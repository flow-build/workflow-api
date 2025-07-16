import { getCockpit } from "../../engine"
import { logger } from "../../utils/logger"

import "../../types/express"
import type { NextFunction, Request, Response } from "express"
import { validate as validateUUID } from "uuid"

export async function fetchWorkflowsWithProcessStatusCount(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("[controllers cockpit workflow] called fetchWorkflowsWithProcessStatusCount")
  const cockpit = getCockpit()
  const filters = req.query
  let is_valid = true
  if (filters.workflow_id) {
    logger.debug("validating workflow_id")
    is_valid = validateUUID(filters.workflow_id as string)
  }
  if (!is_valid) {
    res.status(400).json({ message: "Invalid uuid" })
  }
  else {
    const workflows = await cockpit.fetchWorkflowsWithProcessStatusCount(filters)
    res.status(200).json({ workflows })
  }
  return next()
}
