import { validateBodyWithSchema } from "./base"

import type { JSONSchemaType } from "ajv"

type ProcessStateSet = {
  next_node_id: string
  bag: Record<string, any>
  result: Record<string, any>
}

const processStateSetSchema: JSONSchemaType<ProcessStateSet> = {
  type: "object",
  properties: {
    next_node_id: { type: "string" },
    bag: { type: "object" },
    result: { type: "object" }
  },
  additionalProperties: false,
  required: ["next_node_id", "bag", "result"]
}

type Environment = {
  key: string
  value: string | number | boolean
}

const environmentSchema: JSONSchemaType<Environment> = {
  type: "object",
  properties: {
    key: { type: "string" },
    value: { type: ["string", "number", "boolean"] }
  },
  required: ["key", "value"]
}

type NodeFetch = {
  type: string
  category?: string
}

const fetchNodeSchema: JSONSchemaType<NodeFetch> = {
  type: "object",
  required: ["type"],
  properties: {
    type: { type: "string" },
    category: { type: "string", nullable: true }
  },
  additionalProperties: false
}

export function validateSetProcessState() {
  return validateBodyWithSchema<ProcessStateSet>(processStateSetSchema)
}

export function validateFetchNodeSchema() {
  return validateBodyWithSchema<NodeFetch>(fetchNodeSchema)
}

export function validateEnvironmentSchema() {
  return validateBodyWithSchema<Environment>(environmentSchema)
}
