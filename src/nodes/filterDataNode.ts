import { logger } from "../utils/logger"

import { Nodes, ProcessStatus } from "@flowbuild/engine"
import Ajv from "ajv"
import addFormats from "ajv-formats"

export default class FilterDataNode extends (Nodes.SystemTaskNode as any) {
  static get schema() {
    return {
      type: "object",
      required: ["id", "name", "next", "type", "lane_id", "parameters"],
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        category: { type: "string" },
        type: { type: "string" },
        next: { type: "string" },
        parameters: {
          type: "object",
          required: ["input"],
          properties: {
            input: {
              type: "object",
              required: ["data", "primary_keys"],
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
                primary_keys: { type: "object" }
              }
            }
          }
        },
        lane_id: { type: "string" }
      }
    }
  }

  static validate(spec: any, schema: any = null): [boolean, string] {
    const ajv = new Ajv({ allErrors: true })
    addFormats(ajv)
    const validationSchema = schema || FilterDataNode.schema
    const validate = ajv.compile(validationSchema)
    const validation = validate(spec)
    return [validation as boolean, JSON.stringify(validate.errors)]
  }

  validate(): [boolean, string] {
    return FilterDataNode.validate((this as any)._spec)
  }

  static validateExecutionData(spec: any): [boolean, string] {
    const schema = {
      type: "object",
      required: ["data", "primary_keys"],
      properties: {
        data: { type: "array", items: { type: "object" } },
        primary_keys: { type: "object" }
      }
    }
    return FilterDataNode.validate(spec, schema)
  }

  async _run(executionData: any): Promise<any> {
    try {
      logger.debug("filterData Node running")
      const [is_valid, validation_errors] = FilterDataNode.validateExecutionData(executionData)
      if (!is_valid) {
        const errors = JSON.parse(validation_errors).map((err: any) => `field '${err.instancePath}' ${err.message}`)
        throw JSON.stringify(errors)
      }
      const { data, primary_keys } = executionData

      const keys = Object.keys(primary_keys)
      const result: Record<string, any[]> = { unsorted: [] }
      keys.forEach((key) => {
        result[key] = []
      })

      data.forEach((items: any) => {
        let resultKey: string | undefined
        const validatorKeys = keys.some((key) => {
          const validatorPrimaryKeys = primary_keys[key].some((valueKey: any) => {
            const arr: boolean[] = []
            const keys2 = Object.keys(valueKey)
            keys2.forEach((key2) => {
              arr.push(valueKey[key2] === items[key2])
            })
            if (arr.every(b => b)) {
              resultKey = key
              return true
            }
            else {
              return false
            }
          })
          return validatorPrimaryKeys
        })
        if (validatorKeys && resultKey) {
          result[resultKey].push(items)
        }
        else {
          result.unsorted.push(items)
        }
      })

      return [{ data: result }, ProcessStatus.RUNNING]
    }
    catch (err) {
      logger.error("filterData node failed", err)
      throw err
    }
  }
}
