import { BlueprintSpec } from "../types/flowbuild"

import { logger } from "./logger"

export function identifyTarget(spec: BlueprintSpec) {
  try {
    const { nodes } = spec
    const startNode = nodes.find(node => node.type.toLowerCase() === "start")
    if (!startNode) throw new Error("Start Node not found")
    const { parameters } = startNode
    if (parameters && parameters.target) {
      return [true, parameters.target]
    }
    return [false]
  }
  catch (e) {
    logger.error("Error: ", e)
    return [false]
  }
}
