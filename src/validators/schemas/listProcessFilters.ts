import type { JSONSchemaType } from "ajv/dist/2020"

export type ProcessListFilters = {
  workflow_name?: string | string[]
  workflow_id?: string | string[]
  process_id?: string | string[]
  current_status?: string | string[]
  limit?: number
  offset?: number
}

export const processListSchema: JSONSchemaType<ProcessListFilters> = {
  type: "object",
  properties: {
    workflow_name: {
      oneOf: [
        { type: "string" },
        { type: "array", items: { type: "string" } }
      ],
      nullable: true
    } as any,
    workflow_id: {
      oneOf: [
        { type: "string", format: "uuid" },
        { type: "array", items: { type: "string", format: "uuid" } }
      ],
      nullable: true
    } as any,
    process_id: {
      oneOf: [
        { type: "string", format: "uuid" },
        { type: "array", items: { type: "string", format: "uuid" } }
      ],
      nullable: true
    } as any,
    current_status: {
      oneOf: [
        { type: "string" },
        { type: "array", items: { type: "string" } }
      ],
      nullable: true
    } as any,
    limit: { type: "integer", nullable: true },
    offset: { type: "integer", nullable: true }
  }
}
