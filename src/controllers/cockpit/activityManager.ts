import { getCockpit, getEngine } from "../../engine"
import { logger } from "../../utils/logger"

import "../../types/express"
import type { NextFunction, Request, Response } from "express"

export async function expire(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("Cockpit ActivityManager expire")
  const amid = req.params.id
  const actor_data = req.state?.actor_data
  const engine = getEngine()
  const am = await engine.fetchActivityManager(amid, actor_data)
  if (!am) {
    res.status(404).json({ message: "activity manager not found" })
    return next()
  }
  if (["completed", "interrupted"].includes(am.activity_status)) {
    res.status(409).json({
      message: "activity manager cannot be expired",
      current_status: am.activity_status
    })
    return next()
  }
  const cockpit = getCockpit()
  try {
    await cockpit.expireActivityManager(amid, actor_data)
    res.status(200).json({
      message: "Expire command submitted, check process history for current status"
    })
  }
  catch (e: any) {
    res.status(400).json({ message: `Failed at ${e.message}`, error: e })
  }
  return next()
}
