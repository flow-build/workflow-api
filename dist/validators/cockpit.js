"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSetProcessState = validateSetProcessState;
exports.validateFetchNodeSchema = validateFetchNodeSchema;
exports.validateEnvironmentSchema = validateEnvironmentSchema;
const base_1 = require("./base");
const processStateSetSchema = {
    type: "object",
    properties: {
        next_node_id: { type: "string" },
        bag: { type: "object" },
        result: { type: "object" }
    },
    additionalProperties: false,
    required: ["next_node_id", "bag", "result"]
};
const environmentSchema = {
    type: "object",
    properties: {
        key: { type: "string" },
        value: { type: ["string", "number", "boolean"] }
    },
    required: ["key", "value"]
};
const fetchNodeSchema = {
    type: "object",
    required: ["type"],
    properties: {
        type: { type: "string" },
        category: { type: "string", nullable: true }
    },
    additionalProperties: false
};
function validateSetProcessState() {
    return (0, base_1.validateBodyWithSchema)(processStateSetSchema);
}
function validateFetchNodeSchema() {
    return (0, base_1.validateBodyWithSchema)(fetchNodeSchema);
}
function validateEnvironmentSchema() {
    return (0, base_1.validateBodyWithSchema)(environmentSchema);
}
