import { getEngine } from "../engine"
import { logger } from "../utils/logger"

import "../types/express"
import { buildBlueprintFromBpmn, buildXmlDiagram } from "@flowbuild/nodejs-diagram-builder"
import type { NextFunction, Request, Response } from "express"
import getRawBody from "raw-body"
import { validate as validateUUID } from "uuid"

export async function buildDiagram(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("Called buildDiagram")
  const engine = getEngine()
  const blueprint = req.body
  const workflowId = blueprint?.workflow_id
  let diagram

  if (workflowId) {
    const is_valid = validateUUID(workflowId)
    if (!is_valid) {
      res.status(400).json({ message: "Invalid uuid" })
      return
    }
    const workflow = await engine.fetchWorkflow(workflowId)
    if (!workflow) {
      res.status(404).json({ message: "No such workflow" })
      return
    }
    blueprint.name = workflow._name
    blueprint.description = workflow._description
    blueprint.blueprint_spec = workflow._blueprint_spec
  }

  try {
    diagram = await buildXmlDiagram(blueprint)
    res.status(200).send(diagram)
  }
  catch (err: any) {
    res.status(400).json({ message: `Failed at ${err.message}`, error: err })
  }
  return next()
}

export async function buildBlueprint(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("Called buildBlueprint")
  const diagram = await getRawBody(req)
  try {
    const result = await buildBlueprintFromBpmn(diagram)
    res.status(200).json(result)
  }
  catch (err: any) {
    res.status(400).json({ message: `Failed at ${err.message}`, error: err })
  }
  return next()
}
