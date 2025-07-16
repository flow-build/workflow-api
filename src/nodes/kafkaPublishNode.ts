import * as kafka from "../services/broker/kafka"
import { logger } from "../utils/logger"

import { Nodes, ProcessStatus } from "@flowbuild/engine"
import Ajv from "ajv"
import addFormats from "ajv-formats"

export default class KafkaPublishNode extends (Nodes.SystemTaskNode as any) {
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
              required: ["message", "event", "topic"],
              properties: {
                message: { type: "object" },
                event: { oneOf: [{ type: "object" }, { type: "string" }] },
                topic: { oneOf: [{ type: "object" }, { type: "string" }] }
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
    const validationSchema = schema || KafkaPublishNode.schema
    const validate = ajv.compile(validationSchema)
    const validation = validate(spec)
    return [validation as boolean, JSON.stringify(validate.errors)]
  }

  validate(): [boolean, string] {
    return KafkaPublishNode.validate((this as any)._spec)
  }

  static validateExecutionData(spec: any): [boolean, string] {
    const schema = {
      type: "object",
      required: ["message", "event", "topic"],
      properties: {
        message: { type: "object" },
        event: { type: "string" },
        topic: { type: "string" }
      }
    }
    return KafkaPublishNode.validate(spec, schema)
  }

  _preProcessing({ bag, input, actor_data, environment, parameters }: any): any {
    const executionData = super._preProcessing({ bag, input, actor_data, environment, parameters })
    return { ...executionData, ...{ process_id: parameters.process_id } }
  }

  async _run(executionData: any): Promise<any> {
    try {
      logger.debug("KafkaPublish Node running")
      const [is_valid, validation_errors] = KafkaPublishNode.validateExecutionData(executionData)
      if (!is_valid) {
        const errors = JSON.parse(validation_errors).map((err: any) => `field '${err.instancePath}' ${err.message}`)
        throw JSON.stringify(errors)
      }
      const { message, event, topic } = executionData
      const result = await kafka.publishMessage({
        topic,
        message: { ...message, ...{ processId: executionData.process_id } },
        key: event
      })

      return [{ data: result }, ProcessStatus.RUNNING]
    }
    catch (err) {
      logger.error("KafkaPublish node failed", err)
      throw err
    }
  }
}
