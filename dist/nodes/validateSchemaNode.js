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
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
class ValidateSchemaNode extends engine_1.Nodes.SystemTaskNode {
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
        };
    }
    static validate(spec) {
        const ajv = new ajv_1.default({ allErrors: true });
        (0, ajv_formats_1.default)(ajv);
        const validate = ajv.compile(ValidateSchemaNode.schema);
        const validation = validate(spec);
        return [validation, JSON.stringify(validate.errors)];
    }
    validate() {
        return ValidateSchemaNode.validate(this._spec);
    }
    _run(executionData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ajv = new ajv_1.default({ allErrors: true });
                (0, ajv_formats_1.default)(ajv);
                const validate = ajv.compile(executionData.schema);
                const validation = validate(executionData.data);
                return [
                    {
                        data: {
                            is_valid: validation,
                            errors: validate.errors
                        }
                    },
                    engine_1.ProcessStatus.RUNNING
                ];
            }
            catch (err) {
                logger_1.logger.error("[validateSchemaNode] Node failed", err);
                throw err;
            }
        });
    }
}
exports.default = ValidateSchemaNode;
