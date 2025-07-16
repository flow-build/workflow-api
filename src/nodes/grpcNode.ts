import { logger } from "../utils/logger"

import { Nodes, ProcessStatus } from "@flowbuild/engine"
import grpc from "@grpc/grpc-js"
import protoLoader from "@grpc/proto-loader"
import Ajv from "ajv"
import addFormats from "ajv-formats"
import promiseWrapper from "grpc-client-promise-wrapper"
import grpcReflection from "grpc-reflection-js"

export default class GrpcNode extends (Nodes.SystemTaskNode as any) {
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
              required: ["server", "payload", "service", "method"],
              properties: {
                server: {
                  oneOf: [{ type: "string" }, { type: "object" }]
                },
                service: {
                  oneOf: [{ type: "string" }, { type: "object" }]
                },
                method: {
                  oneOf: [{ type: "string" }, { type: "object" }]
                },
                payload: {
                  oneOf: [{ type: "string" }, { type: "object" }]
                },
                descriptor: { type: "object" },
                useSsl: { type: "boolean" },
                useReflection: { type: "boolean" }
              }
            }
          }
        }
      }
    }
  }

  static validate(data: any, schema: any = null): [boolean, string] {
    const ajv = new Ajv({ allErrors: true })
    addFormats(ajv)
    const validationSchema = schema || GrpcNode.schema
    const validate = ajv.compile(validationSchema)
    const validation = validate(data)
    return [validation as boolean, JSON.stringify(validate.errors)]
  }

  validate(): [boolean, string] {
    return GrpcNode.validate((this as any)._spec)
  }

  static validateExecutionData(spec: any): [boolean, string] {
    const schema = {
      type: "object",
      required: ["server", "payload", "service", "method"],
      properties: {
        server: { type: "string" },
        service: { type: "string" },
        method: { type: "string" },
        useSsl: { type: "boolean" },
        payload: {
          oneOf: [{ type: "string" }, { type: "object" }]
        },
        descriptor: {
          type: "object",
          required: ["file"],
          properties: {
            file: {
              type: "array",
              items: { type: "object" }
            }
          }
        },
        useReflection: { type: "boolean" }
      }
    }
    return GrpcNode.validate(spec, schema)
  }

  static stub(packageDefinition: any, service: string, server: string, useSsl: boolean): any {
    const myService = (grpc.loadPackageDefinition(packageDefinition) as any)[service]
    if (useSsl) {
      return promiseWrapper(new myService(server, grpc.credentials.createSsl()))
    }
    return promiseWrapper(new myService(server, grpc.credentials.createInsecure()))
  }

  async _run(executionData: any): Promise<any> {
    try {
      logger.debug("[GrpcNode] running")
      logger.silly(`[GrpcNode] executionData: ${JSON.stringify(executionData)}`)
      const [is_valid, validation_errors] = GrpcNode.validateExecutionData(executionData)
      logger.silly(`[GrpcNode] executionData validation: ${is_valid}`)
      if (!is_valid) {
        const errors = JSON.parse(validation_errors).map((err: any) => `field '${err.instancePath}' ${err.message}`)
        throw JSON.stringify(errors)
      }
      const { server, service, payload, method, descriptor, useReflection, useSsl } = executionData
      let packageDefinition
      if (useReflection) {
        logger.debug(`[GrpcNode] building reflection definition from: ${server}`)
        const reflectionClient = new grpcReflection.Client(server, grpc.credentials.createInsecure())
        const root = await reflectionClient.fileContainingSymbol(service)
        // lookup to prevent creating a stub for a non-existent service. A error will be thrown
        root.lookupService(service)
        packageDefinition = protoLoader.fromJSON(root)
      }
      else {
        logger.debug(`[GrpcNode] building definition from descriptor`)
        packageDefinition = protoLoader.loadFileDescriptorSetFromObject(descriptor)
      }

      logger.debug(`[GrpcNode] creating a promisified stub for: ${service}`)
      const response = await GrpcNode.stub(packageDefinition, service, server, useSsl)[method](payload)
      return [
        {
          status: "success",
          data: response
        },
        ProcessStatus.RUNNING
      ]
    }
    catch (err) {
      logger.error("[GrpcNode] failed", err)
      throw new Error(err as any)
    }
  }
}
