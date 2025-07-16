import type { JSONSchemaType } from "ajv/dist/2020"

type ProcessStats = {
  workflows: {
    [workflowId: string]: {
      workflow_name: string
      workflow_description: string
      workflow_version: number
    }
  }
}

export const processStatsSchema: JSONSchemaType<ProcessStats> = {
  type: "object",
  properties: {
    workflows: {
      type: "object",
      propertyNames: {
        type: "string",
        format: "uuid"
      },
      patternProperties: {
        ".": {
          type: "object",
          properties: {
            workflow_name: { type: "string" },
            workflow_description: { type: "string" },
            workflow_version: { type: "integer" }
          },
          required: ["workflow_name", "workflow_description", "workflow_version"]
        }
      },
      required: []
    }
  },
  required: ["workflows"]
}
