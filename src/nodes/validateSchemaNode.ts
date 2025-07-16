import { logger } from "../utils/logger"

import { Nodes, ProcessStatus } from "@flowbuild/engine"
import Ajv from "ajv"
import addFormats from "ajv-formats"

export default class ValidateSchemaNode extends (Nodes.SystemTaskNode as any) {
  static get schema() {
    return {
      type: "object",
      required: ["id", "name", "next", "type", "lane_id", "parameters"],
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        next: { type: "string" },
        type: { type: "string" },
        category: { type: "string" },
        lane_id: { type: "string" },
        parameters: {
          type: "object",
          required: ["input"],
          properties: {
            input: {
              type: "object",
              required: ["schema", "data"],
              properties: {
                schema: { type: "object" },
                data: { type: "object" }
              }
            }
          }
        }
      }
    }
  }

  static validate(spec: any): [boolean, string] {
    const ajv = new Ajv({ allErrors: true })
    addFormats(ajv)
    const validate = ajv.compile(ValidateSchemaNode.schema)
    const validation = validate(spec)
    return [validation as boolean, JSON.stringify(validate.errors)]
  }

  validate(): [boolean, string] {
    return ValidateSchemaNode.validate((this as any)._spec)
  }

  async _run(executionData: any): Promise<any> {
    try {
      const ajv = new Ajv({ allErrors: true })
      addFormats(ajv)
      const validate = ajv.compile(executionData.schema)
      const validation = validate(executionData.data)
      return [
        {
          data: {
            is_valid: validation,
            errors: validate.errors
          }
        },
        ProcessStatus.RUNNING
      ]
    }
    catch (err) {
      logger.error("[validateSchemaNode] Node failed", err)
      throw err
    }
  }
}
