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
const lodash_1 = __importDefault(require("lodash"));
class RemapDataNode extends engine_1.Nodes.SystemTaskNode {
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
        };
    }
    static validate(spec, schema = null) {
        const ajv = new ajv_1.default({ allErrors: true });
        (0, ajv_formats_1.default)(ajv);
        const validationSchema = schema || RemapDataNode.schema;
        const validate = ajv.compile(validationSchema);
        const validation = validate(spec);
        return [validation, JSON.stringify(validate.errors)];
    }
    validate() {
        return RemapDataNode.validate(this._spec);
    }
    static validateExecutionData(spec) {
        const schema = {
            type: "object",
            required: ["data", "dictionary"],
            properties: {
                data: { type: "array", items: { type: "object" } },
                dictionary: { type: "object" }
            }
        };
        return RemapDataNode.validate(spec, schema);
    }
    static remapData(data, dictionary) {
        let messages = [];
        const remapped_data = data.map((item) => {
            const remapped_item = {};
            for (const [key, value] of Object.entries(dictionary)) {
                if (typeof value === "object") {
                    const nested_remapped_data = RemapDataNode.remapData([item], dictionary[key]);
                    remapped_item[key] = nested_remapped_data.remapped_data[0];
                    messages = messages.concat(nested_remapped_data.messages);
                }
                else if (typeof value === "string" && value.length > 0 && value.includes(".")) {
                    const object_value = lodash_1.default.get(item, value);
                    if (object_value !== undefined) {
                        remapped_item[key] = object_value;
                    }
                }
                else if (value !== null && value.length > 0 && item[value] !== undefined) {
                    remapped_item[key] = item[value];
                }
                else if (value === null || value.length === 0) {
                    remapped_item[key] = value;
                }
                if (remapped_item[key] === undefined) {
                    messages.push(`'${value}' from dictionary not found in data`);
                }
            }
            return remapped_item;
        });
        return {
            remapped_data,
            messages
        };
    }
    _run(executionData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.logger.debug("remapData Node running");
                const [is_valid, validation_errors] = RemapDataNode.validateExecutionData(executionData);
                if (!is_valid) {
                    const errors = JSON.parse(validation_errors).map((err) => `field '${err.instancePath}' ${err.message}`);
                    throw JSON.stringify(errors);
                }
                const { data, dictionary } = executionData;
                let status = "success";
                let { remapped_data, messages } = RemapDataNode.remapData(data, dictionary);
                if (messages.length > 0) {
                    if (Object.keys(remapped_data[0]).length > 0) {
                        status = "warning";
                    }
                    else {
                        status = "error";
                        remapped_data = [];
                    }
                }
                return [
                    {
                        status,
                        messages,
                        data: remapped_data
                    },
                    engine_1.ProcessStatus.RUNNING
                ];
            }
            catch (err) {
                logger_1.logger.error("remapData Node failed", err);
                throw new Error(err);
            }
        });
    }
}
exports.default = RemapDataNode;
