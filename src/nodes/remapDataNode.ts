import { logger } from "../utils/logger"

import { Nodes, ProcessStatus } from "@flowbuild/engine"
import Ajv from "ajv"
import addFormats from "ajv-formats"
import _ from "lodash"

export default class RemapDataNode extends (Nodes.SystemTaskNode as any) {
  static get schema() {
    return {
      type: "object",
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
              required: ["data", "dictionary"],
              properties: {
                data: {
                  oneOf: [
                    {
                      type: "array",
                      items: { type: "object" }
                    },
                    {
                      type: "object"
                    }
                  ]
                },
                dictionary: {
                  type: "object"
                }
              }
            }
          }
        }
      },
      required: ["id", "name", "next", "type", "lane_id", "parameters"]
    }
  }

  static validate(spec: any, schema: any = null): [boolean, string] {
    const ajv = new Ajv({ allErrors: true })
    addFormats(ajv)
    const validationSchema = schema || RemapDataNode.schema
    const validate = ajv.compile(validationSchema)
    const validation = validate(spec)
    return [validation as boolean, JSON.stringify(validate.errors)]
  }

  validate(): [boolean, string] {
    return RemapDataNode.validate((this as any)._spec)
  }

  static validateExecutionData(spec: any): [boolean, string] {
    const schema = {
      type: "object",
      required: ["data", "dictionary"],
      properties: {
        data: { type: "array", items: { type: "object" } },
        dictionary: { type: "object" }
      }
    }
    return RemapDataNode.validate(spec, schema)
  }

  static remapData(data: any[], dictionary: Record<string, any>): { remapped_data: any[], messages: string[] } {
    let messages: string[] = []
    const remapped_data = data.map((item) => {
      const remapped_item: Record<string, any> = {}
      for (const [key, value] of Object.entries(dictionary)) {
        if (typeof value === "object") {
          const nested_remapped_data = RemapDataNode.remapData([item], dictionary[key])
          remapped_item[key] = nested_remapped_data.remapped_data[0]
          messages = messages.concat(nested_remapped_data.messages)
        }
        else if (typeof value === "string" && value.length > 0 && value.includes(".")) {
          const object_value = _.get(item, value)
          if (object_value !== undefined) {
            remapped_item[key] = object_value
          }
        }
        else if (value !== null && value.length > 0 && item[value] !== undefined) {
          remapped_item[key] = item[value]
        }
        else if (value === null || value.length === 0) {
          remapped_item[key] = value
        }

        if (remapped_item[key] === undefined) {
          messages.push(`'${value}' from dictionary not found in data`)
        }
      }
      return remapped_item
    })
    return {
      remapped_data,
      messages
    }
  }

  async _run(executionData: any): Promise<any> {
    try {
      logger.debug("remapData Node running")
      const [is_valid, validation_errors] = RemapDataNode.validateExecutionData(executionData)
      if (!is_valid) {
        const errors = JSON.parse(validation_errors).map((err: any) => `field '${err.instancePath}' ${err.message}`)
        throw JSON.stringify(errors)
      }
      const { data, dictionary } = executionData
      let status = "success"

      // eslint-disable-next-line prefer-const
      let { remapped_data, messages } = RemapDataNode.remapData(data, dictionary)

      if (messages.length > 0) {
        if (Object.keys(remapped_data[0]).length > 0) {
          status = "warning"
        }
        else {
          status = "error"
          remapped_data = []
        }
      }

      return [
        {
          status,
          messages,
          data: remapped_data
        },
        ProcessStatus.RUNNING
      ]
    }
    catch (err) {
      logger.error("remapData Node failed", err)
      throw new Error(err as any)
    }
  }
}
