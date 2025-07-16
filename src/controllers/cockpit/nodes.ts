import { getCockpit } from "../../engine"

import "../../types/express"
import { getNode, NodeUtils } from "@flowbuild/engine"
import type { NextFunction, Request, Response } from "express"

export async function getNodes(req: Request, res: Response, next: NextFunction): Promise<void> {
  const types = NodeUtils.getNodeTypes()
  const categories = NodeUtils.getNodeCategories()
  const cockpit = getCockpit()
  const actor_data = req.state?.actor_data
  const workflows = await cockpit.getWorkflowsForActor(actor_data)
  const nodes = workflows.flatMap((w: any) => w.blueprint_spec.nodes)
  const typeKeys = Object.keys(types)
  const categoryKeys = Object.keys(categories)
  res.status(200).json({
    types: typeKeys.map(type => ({
      type: type,
      nodes: nodes.filter((node: any) => node.type.toLowerCase() === type).length
    })),
    categories: categoryKeys.map(category => ({
      category: category,
      nodes: nodes.filter((node: any) => node.category?.toLowerCase() === category).length
    }))
  })
  return next()
}

export async function fetchNode(req: Request, res: Response, next: NextFunction): Promise<void> {
  const body = req.body
  if (body.type.toLowerCase() === "systemtask" && !body.category) {
    res.status(400).json({
      message: "Invalid Request Body",
      error: [{ message: "systemTasks must have required property category" }]
    })
    return next()
  }
  try {
    const node = getNode(body)
    res.status(200).json({ schema: node.constructor.schema })
    return next()
  }
  catch (e: any) {
    console.log(e)
    res.status(404).json({ message: e.toString() })
    return next()
  }
}
