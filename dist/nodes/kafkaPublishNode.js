"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const kafka = __importStar(require("../services/broker/kafka"));
const logger_1 = require("../utils/logger");
const engine_1 = require("@flowbuild/engine");
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
class KafkaPublishNode extends engine_1.Nodes.SystemTaskNode {
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
        };
    }
    static validate(spec, schema = null) {
        const ajv = new ajv_1.default({ allErrors: true });
        (0, ajv_formats_1.default)(ajv);
        const validationSchema = schema || KafkaPublishNode.schema;
        const validate = ajv.compile(validationSchema);
        const validation = validate(spec);
        return [validation, JSON.stringify(validate.errors)];
    }
    validate() {
        return KafkaPublishNode.validate(this._spec);
    }
    static validateExecutionData(spec) {
        const schema = {
            type: "object",
            required: ["message", "event", "topic"],
            properties: {
                message: { type: "object" },
                event: { type: "string" },
                topic: { type: "string" }
            }
        };
        return KafkaPublishNode.validate(spec, schema);
    }
    _preProcessing({ bag, input, actor_data, environment, parameters }) {
        const executionData = super._preProcessing({ bag, input, actor_data, environment, parameters });
        return Object.assign(Object.assign({}, executionData), { process_id: parameters.process_id });
    }
    _run(executionData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.logger.debug("KafkaPublish Node running");
                const [is_valid, validation_errors] = KafkaPublishNode.validateExecutionData(executionData);
                if (!is_valid) {
                    const errors = JSON.parse(validation_errors).map((err) => `field '${err.instancePath}' ${err.message}`);
                    throw JSON.stringify(errors);
                }
                const { message, event, topic } = executionData;
                const result = yield kafka.publishMessage({
                    topic,
                    message: Object.assign(Object.assign({}, message), { processId: executionData.process_id }),
                    key: event
                });
                return [{ data: result }, engine_1.ProcessStatus.RUNNING];
            }
            catch (err) {
                logger_1.logger.error("KafkaPublish node failed", err);
                throw err;
            }
        });
    }
}
exports.default = KafkaPublishNode;
