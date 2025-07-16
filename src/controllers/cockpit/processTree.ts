import { getCockpit } from "../../engine"
import { db } from "../../utils/db"
import { logger } from "../../utils/logger"

import "../../types/express"
import { Tree } from "@flowbuild/process-tree"
import type { NextFunction, Request, Response } from "express"

const tree = new Tree(db)

export async function getProcessTree(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("called getProcessTree")
  const process_id = req.params.id
  const myTree = await tree.getPath(process_id)
  const cockpit = getCockpit()
  const promises = myTree.map(async (p: any) => {
    const process = await cockpit.fetchProcess(p.processId)
    return {
      process_id: p.processId,
      parent_id: p.parentId,
      depth: p.depth,
      workflow_name: process.workflow_name,
      current_status: process._current_status
    }
  })
  const processes = await Promise.all(promises)
  if (myTree) {
    res.status(200).json(processes)
  }
  else {
    res.status(404).json({ message: "Not found" })
  }
  return next()
}
