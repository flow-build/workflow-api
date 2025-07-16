import { getCockpit } from "../engine"
import type { BlueprintSpec, Lane, Node } from "../types/flowbuild"
import type { Workflow } from "../types/workflow"
import { logger } from "../utils/logger"

import { categorySchema, nodeSchema } from "./schemas/nodes"
import { workflowSchema } from "./schemas/workflow"
import { validateBodyWithSchema, validateDataWithSchema, type ValidateOutput } from "./base"

import "../types/express"
import { ErrorObject } from "ajv/dist/2020"
import type { NextFunction, Request, Response } from "express"

function isUnique(array: any[]) {
  const uniqueArray = [...new Set(array)]
  return array.length === uniqueArray.length
};

export async function validateSaveWorkflow(): Promise<void> {
  validateBodyWithSchema<Workflow>(workflowSchema)
}

export async function validateCreateProcess(): Promise<void> {
  validateBodyWithSchema<Record<string, any>>({ type: "object" })
}

type NodeValidation = {
  data: Node
  isValid: boolean
  errors: ErrorObject<string, Record<string, any>, unknown>[]
}

export async function validateNodes(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.debug("[validators workflow] called validateNodes")
  const blueprintSpec = req.body.blueprint_spec

  const validateNode = blueprintSpec.nodes.map(async (node: Node) => {
    const nodeType = node.type.toLowerCase()
    let parametersValidation: ValidateOutput
    let typeValidation: ValidateOutput

    let nodeCategory
    if (nodeType === "systemtask") {
      nodeCategory = node.category?.toLowerCase() || ""
    }

    if (nodeSchema[nodeType]) {
      logger.silly("validate type")
      typeValidation = await validateDataWithSchema(nodeSchema[nodeType], node)
    }
    else {
      logger.info(`bypassing type validation, no schema defined for type [${nodeType}]`)
      typeValidation = { isValid: true, errors: [] }
    }

    if (nodeCategory) {
      logger.silly("validate category")
      if (categorySchema[nodeCategory]) {
        parametersValidation = await validateDataWithSchema(categorySchema[nodeCategory], node.parameters)
      }
      else {
        logger.info(`bypassing parameters validation, no schema defined for category [${nodeCategory}]`)
        parametersValidation = { isValid: true, errors: [] }
      }
    }
    else {
      parametersValidation = { isValid: true, errors: [] }
    }

    return {
      data: node,
      isValid: typeValidation.isValid && parametersValidation.isValid,
      errors: [...(typeValidation?.errors || []), ...(parametersValidation?.errors || [])]
    }
  })

  const nodesResult: NodeValidation[] = await Promise.all(validateNode)

  const errors = nodesResult.reduce((acc, item) => {
    if (item.isValid) {
      return acc
    }
    else {
      return ++acc
    }
  }, 0)

  if (errors > 0) {
    res.status(400).send({
      message: "Invalid Node",
      error: nodesResult
        .filter(item => !item.isValid)
        .map((result) => {
          return {
            node: result.data.id,
            type: result.data.type,
            category: result.data.category,
            errors: result.errors.map((error) => {
              return {
                field: error.instancePath,
                message: error.message
              }
            })
          }
        })
    })
    return
  }
  else {
    return next()
  }
};

export async function validateConnections(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.debug("called validateConnections")
  const blueprintSpec = req.body.blueprint_spec

  const lanes = blueprintSpec.lanes.map((lane: Lane) => {
    return lane.id
  })

  const nodes: string[] = blueprintSpec.nodes.map((node: Node) => {
    return node.id
  })

  const nodeConnections = blueprintSpec.nodes.map(async (node: Node) => {
    if (node.type.toLowerCase() === "flow") {
      if (!node.next) throw new Error("No next")
      const next = Object.values(node.next)
      return {
        id: node.id,
        name: node.name,
        unique: nodes.filter((item: string) => item === node.id).length === 1,
        lane: lanes.includes(node.lane_id),
        next: next.reduce((acc, n) => {
          if (!nodes.includes(n)) {
            return false
          }
          return acc
        }, true)
      }
    }
    else {
      return {
        id: node.id,
        name: node.name,
        unique: nodes.filter(item => item === node.id).length === 1,
        lane: lanes.includes(node.lane_id),
        next: node.next ? nodes.includes(node.next.toString()) : true
      }
    }
  })

  const nodesResult = await Promise.all(nodeConnections)

  let errors = await nodesResult.reduce((acc, item) => {
    if (!item.lane || !item.next || !item.unique) {
      return ++acc
    }
    else {
      return acc
    }
  }, 0)

  const errorMessage = []

  if (!isUnique(lanes)) {
    errors++
    errorMessage.push({
      lanes: "There is a duplicated lane id"
    })
  }

  if (errors > 0) {
    res.status(400).send({
      message: "Invalid Connections",
      error: [...errorMessage, ...nodesResult.filter(item => !item.lane || !item.next || !item.unique)]
    })
    return
  }
  return next()
};

export async function validateEnvironmentVariable(spec: BlueprintSpec) {
  const validateInfo = []
  const cockpit = getCockpit()

  const nodesString = JSON.stringify(spec.nodes)
  for await (const [key, value] of Object.entries(spec.environment)) {
    const variable = await cockpit.fetchEnvironmentVariable(value)
    if (!variable) {
      const error_message = `Variable ${key} not found at the environment`
      validateInfo.push(error_message)
    }
    if (!nodesString.includes(`environment.${key}`)) {
      const error_message = `Variable ${key} not declared in any node`
      validateInfo.push(error_message)
    }
  }

  return validateInfo
}

export function validateNodesExtract(spec: BlueprintSpec) {
  const validateInfo = []

  for (const node of spec.nodes) {
    if (node?.extract !== node?.extract?.toLowerCase()) {
      const warning_message = `Node ${node.id}: extract will be saved in lower case - ${node?.extract?.toLowerCase()}`
      validateInfo.push(warning_message)
    }
  }

  return validateInfo
}
