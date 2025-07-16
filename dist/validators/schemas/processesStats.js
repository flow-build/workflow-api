"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processStatsSchema = void 0;
exports.processStatsSchema = {
    type: "object",
    properties: {
        workflows: {
            type: "object",
            propertyNames: {
                type: "string",
                format: "uuid"
            },
            patternProperties: {
                ".": {
                    type: "object",
                    properties: {
                        workflow_name: { type: "string" },
                        workflow_description: { type: "string" },
                        workflow_version: { type: "integer" }
                    },
                    required: ["workflow_name", "workflow_description", "workflow_version"]
                }
            },
            required: []
        }
    },
    required: ["workflows"]
};
