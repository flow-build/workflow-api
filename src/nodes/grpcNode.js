const { ProcessStatus, Nodes } = require("@flowbuild/engine");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { logger } = require("../utils/logger");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const grpcReflection = require("grpc-reflection-js");
const promiseWrapper = require("grpc-client-promise-wrapper");

class GrpcNode extends Nodes.SystemTaskNode {
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
                  oneOf: [{ type: "string" }, { type: "object" }],
                },
                service: {
                  oneOf: [{ type: "string" }, { type: "object" }],
                },
                method: {
                  oneOf: [{ type: "string" }, { type: "object" }],
                },
                payload: {
                  oneOf: [{ type: "string" }, { type: "object" }],
                },
                descriptor: { type: "object" },
                useReflection: { type: "boolean" },
              },
            },
          },
        },
      },
    };
  }

  static validate(spec, schema = null) {
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    const validationSchema = schema || GrpcNode.schema;
    const validate = ajv.compile(validationSchema);
    const validation = validate(spec);
    return [validation, JSON.stringify(validate.errors)];
  }

  validate() {
    return GrpcNode.validate(this._spec);
  }

  static validateExecutionData(spec) {
    const schema = {
      type: "object",
      required: ["server", "payload", "service", "method"],
      properties: {
        server: { type: "string" },
        service: { type: "string" },
        method: { type: "string" },
        payload: {
          oneOf: [{ type: "string" }, { type: "object" }],
        },
        descriptor: { 
          type: "object",
          required: ["file"],
          properties: {
            file: { 
              type: 'array',
              items: { type: 'object' } 
            }
          } 
        },
        useReflection: { type: "boolean" },
      },
    };
    return GrpcNode.validate(spec, schema);
  }

  static stub(packageDefinition, service, server) {
    const myService = grpc.loadPackageDefinition(packageDefinition)[service];
    return promiseWrapper(new myService(server, grpc.credentials.createInsecure()));
  }

  async _run(executionData) {
    try {
      logger.debug("[GrpcNode] running");
      logger.debug(`[GrpcNode] executionData: ${JSON.stringify(executionData)}`);
      const [is_valid, validation_errors] = GrpcNode.validateExecutionData(executionData);
      logger.debug(`[GrpcNode] executionData validation: ${is_valid}`);
      if (!is_valid) {
        const errors = JSON.parse(validation_errors).map((err) => `field '${err.instancePath}' ${err.message}`);
        throw JSON.stringify(errors);
      }
      const { server, service, payload, method, descriptor, useReflection } = executionData;
      let packageDefinition;
      if (useReflection) {
        logger.debug(`[GrpcNode] building reflection definition from: ${server}`);
        const reflectionClient = new grpcReflection.Client(server, grpc.credentials.createInsecure());
        const root = await reflectionClient.fileContainingSymbol(service);
        //lookup to prevent creating a stub for a non-existent service. A error will be thrown
        root.lookupService(service);
        packageDefinition = protoLoader.fromJSON(root);
      } else {
        logger.debug(`[GrpcNode] building definition from descriptor`);
        packageDefinition = protoLoader.loadFileDescriptorSetFromObject(descriptor);
      }

      logger.debug(`[GrpcNode] creating a promisified stub for: ${service}`);
      const response = await GrpcNode.stub(packageDefinition, service, server)[method](payload);
      return [
        {
          status: "success",
          data: response,
        },
        ProcessStatus.RUNNING,
      ];
    } catch (err) {
      logger.error("[GrpcNode] failed", err);
      throw new Error(err);
    }
  }
}

module.exports = GrpcNode;
