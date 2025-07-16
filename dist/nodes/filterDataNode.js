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
class FilterDataNode extends engine_1.Nodes.SystemTaskNode {
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
        };
    }
    static validate(spec, schema = null) {
        const ajv = new ajv_1.default({ allErrors: true });
        (0, ajv_formats_1.default)(ajv);
        const validationSchema = schema || FilterDataNode.schema;
        const validate = ajv.compile(validationSchema);
        const validation = validate(spec);
        return [validation, JSON.stringify(validate.errors)];
    }
    validate() {
        return FilterDataNode.validate(this._spec);
    }
    static validateExecutionData(spec) {
        const schema = {
            type: "object",
            required: ["data", "primary_keys"],
            properties: {
                data: { type: "array", items: { type: "object" } },
                primary_keys: { type: "object" }
            }
        };
        return FilterDataNode.validate(spec, schema);
    }
    _run(executionData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.logger.debug("filterData Node running");
                const [is_valid, validation_errors] = FilterDataNode.validateExecutionData(executionData);
                if (!is_valid) {
                    const errors = JSON.parse(validation_errors).map((err) => `field '${err.instancePath}' ${err.message}`);
                    throw JSON.stringify(errors);
                }
                const { data, primary_keys } = executionData;
                const keys = Object.keys(primary_keys);
                const result = { unsorted: [] };
                keys.forEach((key) => {
                    result[key] = [];
                });
                data.forEach((items) => {
                    let resultKey;
                    const validatorKeys = keys.some((key) => {
                        const validatorPrimaryKeys = primary_keys[key].some((valueKey) => {
                            const arr = [];
                            const keys2 = Object.keys(valueKey);
                            keys2.forEach((key2) => {
                                arr.push(valueKey[key2] === items[key2]);
                            });
                            if (arr.every(b => b)) {
                                resultKey = key;
                                return true;
                            }
                            else {
                                return false;
                            }
                        });
                        return validatorPrimaryKeys;
                    });
                    if (validatorKeys && resultKey) {
                        result[resultKey].push(items);
                    }
                    else {
                        result.unsorted.push(items);
                    }
                });
                return [{ data: result }, engine_1.ProcessStatus.RUNNING];
            }
            catch (err) {
                logger_1.logger.error("filterData node failed", err);
                throw err;
            }
        });
    }
}
exports.default = FilterDataNode;
