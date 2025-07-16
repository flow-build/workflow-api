import type { ProcessListFilters } from "./schemas/listProcessFilters"
import { processListSchema } from "./schemas/listProcessFilters"
import { validateBodyWithSchema } from "./base"

import { JSONSchemaType } from "ajv"

type RunProcess = Record<string, any>

const runProcessSchema: JSONSchemaType<RunProcess> = {
  type: "object",
  properties: {},
  required: []
}

export function validateRunProcess() {
  return validateBodyWithSchema<RunProcess>(runProcessSchema)
}

export function validateFindProcesses() {
  return validateBodyWithSchema<ProcessListFilters>(processListSchema)
}
