"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../utils/logger");
const engine_1 = require("@flowbuild/engine");
const grpc_js_1 = __importDefault(require("@grpc/grpc-js"));
const proto_loader_1 = __importDefault(require("@grpc/proto-loader"));
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const grpc_client_promise_wrapper_1 = __importDefault(require("grpc-client-promise-wrapper"));
const grpc_reflection_js_1 = __importDefault(require("grpc-reflection-js"));
class GrpcNode extends engine_1.Nodes.SystemTaskNode {
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
        };
    }
    static validate(data, schema = null) {
        const ajv = new ajv_1.default({ allErrors: true });
        (0, ajv_formats_1.default)(ajv);
        const validationSchema = schema || GrpcNode.schema;
        const validate = ajv.compile(validationSchema);
        const validation = validate(data);
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
        };
        return GrpcNode.validate(spec, schema);
    }
    static stub(packageDefinition, service, server, useSsl) {
        const myService = grpc_js_1.default.loadPackageDefinition(packageDefinition)[service];
        if (useSsl) {
            return (0, grpc_client_promise_wrapper_1.default)(new myService(server, grpc_js_1.default.credentials.createSsl()));
        }
        return (0, grpc_client_promise_wrapper_1.default)(new myService(server, grpc_js_1.default.credentials.createInsecure()));
    }
    _run(executionData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.logger.debug("[GrpcNode] running");
                logger_1.logger.silly(`[GrpcNode] executionData: ${JSON.stringify(executionData)}`);
                const [is_valid, validation_errors] = GrpcNode.validateExecutionData(executionData);
                logger_1.logger.silly(`[GrpcNode] executionData validation: ${is_valid}`);
                if (!is_valid) {
                    const errors = JSON.parse(validation_errors).map((err) => `field '${err.instancePath}' ${err.message}`);
                    throw JSON.stringify(errors);
                }
                const { server, service, payload, method, descriptor, useReflection, useSsl } = executionData;
                let packageDefinition;
                if (useReflection) {
                    logger_1.logger.debug(`[GrpcNode] building reflection definition from: ${server}`);
                    const reflectionClient = new grpc_reflection_js_1.default.Client(server, grpc_js_1.default.credentials.createInsecure());
                    const root = yield reflectionClient.fileContainingSymbol(service);
                    root.lookupService(service);
                    packageDefinition = proto_loader_1.default.fromJSON(root);
                }
                else {
                    logger_1.logger.debug(`[GrpcNode] building definition from descriptor`);
                    packageDefinition = proto_loader_1.default.loadFileDescriptorSetFromObject(descriptor);
                }
                logger_1.logger.debug(`[GrpcNode] creating a promisified stub for: ${service}`);
                const response = yield GrpcNode.stub(packageDefinition, service, server, useSsl)[method](payload);
                return [
                    {
                        status: "success",
                        data: response
                    },
                    engine_1.ProcessStatus.RUNNING
                ];
            }
            catch (err) {
                logger_1.logger.error("[GrpcNode] failed", err);
                throw new Error(err);
            }
        });
    }
}
exports.default = GrpcNode;
