import { logger } from "../utils/logger"

import { Nodes, ProcessStatus } from "@flowbuild/engine"
import Ajv from "ajv"
import addFormats from "ajv-formats"
import { nanoid } from "nanoid"
import * as uuid from "uuid"

interface CreateUuidNodeInput {
  type: "uuid" | "nanoid"
  options?: {
    version?: "v1" | "v4"
    size?: number | object
  }
}

interface CreateUuidNodeExecutionData {
  type: "uuid" | "nanoid"
  options?: {
    version?: "v1" | "v4"
    size?: number
  }
}

interface CreateUuidNodeSpec {
  id: string
  name: string
  next: string
  type: string
  category: string
  lane_id: string
  parameters: {
    input: CreateUuidNodeInput
  }
}

interface CreateUuidNodeResult {
  id: string
}

export default class CreateUuidNode extends (Nodes.SystemTaskNode as any) {
  _spec!: CreateUuidNodeSpec

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
          properties: {
            input: {
              type: "object",
              required: ["type"],
              properties: {
                type: { type: "string", enum: ["uuid", "nanoid"] },
                options: {
                  type: "object",
                  properties: {
                    version: { type: "string", enum: ["v1", "v4"] },
                    size: {
                      oneOf: [{ type: "integer" }, { type: "object" }]
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  static validate(spec: CreateUuidNodeSpec): [boolean, string] {
    const ajv = new Ajv({ allErrors: true })
    addFormats(ajv)
    const validate = ajv.compile(CreateUuidNode.schema)
    const validation = validate(spec)
    return [validation as boolean, JSON.stringify(validate.errors ?? "")]
  }

  validate(): [boolean, string] {
    return CreateUuidNode.validate(this._spec)
  }

  async _run(executionData: CreateUuidNodeExecutionData): Promise<[CreateUuidNodeResult, string]> {
    const result: CreateUuidNodeResult = { id: "" }

    function getVersion(uVersion?: "v1" | "v4") {
      if (!uVersion) return uuid.v1()

      const version = {
        v1: () => uuid.v1(),
        v4: () => uuid.v4()
      }

      return (version[uVersion] || uuid.v1)()
    }

    try {
      if (executionData.type === "nanoid") {
        const size = executionData.options?.size
        if (typeof size === "number") {
          result.id = nanoid(size)
        }
        else {
          result.id = nanoid()
        }
      }
      else {
        result.id = getVersion(executionData.options?.version)
      }
    }
    catch (error) {
      logger.error(
        "NODE.ERROR",
        `ERROR AT NID [${(this as any).id}] | CREATE UUID | unexpected error`,
        {
          node_id: (this as any).id,
          error: error
        }
      )
      throw new Error(error as any)
    }

    return [result, ProcessStatus.RUNNING]
  }
}
