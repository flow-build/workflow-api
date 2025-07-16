import type { JSONSchemaType } from "ajv/dist/2020"

type ProcessExecution = {
  state_id: string
  step_number: number
  node_type: string
  node: string
  next_node_id: string | null
  status: string
}

export const processExecutionSchema: JSONSchemaType<ProcessExecution[]> = {
  type: "array",
  items: {
    type: "object",
    properties: {
      state_id: { type: "string", format: "uuid" },
      step_number: { type: "integer" },
      node_type: { type: "string" },
      node: { type: "string" },
      next_node_id: { anyOf: [{ type: "string" }, { type: "null" }] } as any,
      status: { type: "string" }
    },
    required: ["state_id", "step_number", "node_type", "node", "status"]
  }
}
