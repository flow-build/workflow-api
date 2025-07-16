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
const lodash_1 = require("lodash");
class DeepCompareNode extends engine_1.Nodes.SystemTaskNode {
    static get schema() {
        return {
            type: "object",
            required: ["id", "name", "next", "type", "category", "lane_id", "parameters"],
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
                            required: ["base", "candidate", "commonKeys"],
                            properties: {
                                base: {
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
                                candidate: {
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
                                commonKeys: {
                                    oneOf: [
                                        {
                                            type: "array",
                                            items: { type: "string" }
                                        },
                                        {
                                            type: "object"
                                        }
                                    ]
                                },
                                ignoreKeys: {
                                    oneOf: [
                                        {
                                            type: "array",
                                            items: { type: "string" }
                                        },
                                        {
                                            type: "object"
                                        }
                                    ]
                                }
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
        const validationSchema = schema || DeepCompareNode.schema;
        const validate = ajv.compile(validationSchema);
        const validation = validate(data);
        return [validation, JSON.stringify(validate.errors)];
    }
    validate() {
        return DeepCompareNode.validate(this._spec);
    }
    static validateExecutionData(data) {
        const schema = {
            type: "object",
            required: ["base", "candidate", "commonKeys"],
            properties: {
                base: {
                    type: "array",
                    items: { type: "object" }
                },
                candidate: {
                    type: "array",
                    items: { type: "object" }
                },
                commonKeys: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 1
                },
                ignoreKeys: {
                    type: "array",
                    items: { type: "string" }
                }
            }
        };
        return DeepCompareNode.validate(data, schema);
    }
    static clean(data, keys, ignore = []) {
        logger_1.logger.silly("Called DeepCompareNode clean");
        logger_1.logger.silly(`[DeepCompareNode] data: ${JSON.stringify(data)}`);
        const withoutIgnore = data.map(item => (0, lodash_1.omit)(item, ignore));
        logger_1.logger.silly(`[DeepCompareNode] withoutIgnore: ${JSON.stringify(withoutIgnore)}`);
        const cleanData = (0, lodash_1.uniqWith)(withoutIgnore, lodash_1.isEqual);
        logger_1.logger.silly(`[DeepCompareNode] cleanData: ${JSON.stringify(cleanData)}`);
        const keysOnly = cleanData.map(item => (0, lodash_1.pick)(item, keys));
        logger_1.logger.silly(`[DeepCompareNode] keysOnly: ${JSON.stringify(keysOnly)}`);
        const keySet = (0, lodash_1.uniqWith)(keysOnly, lodash_1.isEqual);
        logger_1.logger.silly(`[DeepCompareNode] keySet: ${JSON.stringify(keySet)}`);
        if (keySet.length < keysOnly.length) {
            return { duplicates: true };
        }
        else {
            return cleanData;
        }
    }
    _run(executionData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.logger.debug("DeepCompare Node running");
                logger_1.logger.silly(`[DeepCompare] executionData: ${JSON.stringify(executionData)}`);
                const [is_valid, validation_errors] = DeepCompareNode.validateExecutionData(executionData);
                if (!is_valid) {
                    const errors = JSON.parse(validation_errors).map((err) => `field '${err.instancePath}' ${err.message}`);
                    return [
                        {
                            status: "error",
                            message: errors,
                            data: []
                        },
                        engine_1.ProcessStatus.RUNNING
                    ];
                }
                logger_1.logger.silly("[DeepCompare] Cleaning base");
                const base = DeepCompareNode.clean(executionData.base, executionData.commonKeys, executionData.ignoreKeys);
                if (base.duplicates) {
                    return [
                        {
                            status: "error",
                            message: "conflict at base",
                            data: []
                        },
                        engine_1.ProcessStatus.RUNNING
                    ];
                }
                logger_1.logger.silly(`[DeepCompare] cleanBase: ${JSON.stringify(base)}`);
                logger_1.logger.silly("Cleaning candidate");
                const candidate = DeepCompareNode.clean(executionData.candidate, executionData.commonKeys, executionData.ignoreKeys);
                if (candidate.duplicates) {
                    return [
                        {
                            status: "error",
                            message: "conflict at candidate",
                            data: []
                        },
                        engine_1.ProcessStatus.RUNNING
                    ];
                }
                logger_1.logger.silly(`[DeepCompare] cleanCandidate: ${JSON.stringify(candidate)}`);
                const result = {
                    onlyAtCandidate: [],
                    onlyAtBase: [],
                    unchanged: [],
                    changed: []
                };
                let candidateList = candidate;
                for (const baseItem of base) {
                    logger_1.logger.silly(`[DeepCompare] baseItem: ${JSON.stringify(baseItem)}`);
                    const keys = (0, lodash_1.pick)(baseItem, executionData.commonKeys);
                    logger_1.logger.silly(`[DeepCompare] keys: ${JSON.stringify(keys)}`);
                    const matchingCandidate = (0, lodash_1.filter)(candidate, keys);
                    logger_1.logger.silly(`[DeepCompare] matchingCandidate: ${JSON.stringify(matchingCandidate)}`);
                    if (matchingCandidate.length > 0) {
                        if ((0, lodash_1.isEqual)(baseItem, matchingCandidate[0])) {
                            logger_1.logger.silly(`[DeepCompare] baseItem = UNCHANGED`);
                            result.unchanged.push(keys);
                        }
                        else {
                            logger_1.logger.silly(`[DeepCompare] baseItem = CHANGED`);
                            result.changed.push(keys);
                        }
                        candidateList = (0, lodash_1.reject)(candidateList, keys);
                        logger_1.logger.silly(`[DeepCompare] remaining candidates: ${JSON.stringify(candidateList)}`);
                    }
                    else {
                        logger_1.logger.silly(`[DeepCompare] baseItem = ONLY AT BASE`);
                        result.onlyAtBase.push(keys);
                    }
                }
                result.onlyAtCandidate = candidateList.map((item) => (0, lodash_1.pick)(item, executionData.commonKeys));
                return [
                    {
                        data: result
                    },
                    engine_1.ProcessStatus.RUNNING
                ];
            }
            catch (err) {
                logger_1.logger.error("deepCompareNode Node failed", err);
                throw new Error(err);
            }
        });
    }
}
exports.default = DeepCompareNode;
