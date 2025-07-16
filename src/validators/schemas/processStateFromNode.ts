import type { JSONSchemaType } from "ajv/dist/2020"

type ProcessStateFromNodeItem = {
  workflow_name: string
  version: number
  workflow_id: string
  state_id: string
  step_number: number
  next_node_id: string
  result: Record<string, any>
  status: string
  created_at: string
}

export type ProcessStateFromNode = ProcessStateFromNodeItem[]

export const processStateFromNodeSchema: JSONSchemaType<ProcessStateFromNode> = {
  type: "array",
  items: {
    type: "object",
    properties: {
      workflow_name: { type: "string" },
      version: { type: "integer" },
      workflow_id: { type: "string", format: "uuid" },
      state_id: { type: "string", format: "uuid" },
      step_number: { type: "integer" },
      next_node_id: { type: "string" },
      result: { type: "object" },
      status: { type: "string" },
      created_at: { type: "string", format: "date-time" }
    },
    required: [
      "workflow_name",
      "version",
      "workflow_id",
      "state_id",
      "step_number",
      "next_node_id",
      "result",
      "status",
      "created_at"
    ]
  }
}
