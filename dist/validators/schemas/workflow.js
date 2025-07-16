"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowSchema = void 0;
exports.workflowSchema = {
    type: "object",
    properties: {
        workflow_id: { type: "string", format: "uuid" },
        name: { type: "string" },
        description: { type: "string" },
        blueprint_spec: {
            type: "object",
            properties: {
                requirements: {
                    type: "array",
                    items: { type: "string" },
                    uniqueItems: true
                },
                prepare: {
                    type: "array",
                    items: { type: "string" },
                    uniqueItems: true
                },
                environment: { type: "object" },
                parameters: { type: "object", nullable: true, additionalProperties: true },
                lanes: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                            rule: {
                                oneOf: [
                                    { type: "array" },
                                    {
                                        type: "object",
                                        required: ["$js"],
                                        properties: {
                                            $js: { type: "string" }
                                        }
                                    }
                                ]
                            }
                        },
                        additionalProperties: false,
                        required: ["id", "name", "rule"]
                    },
                    uniqueItems: true,
                    minItems: 1
                },
                nodes: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                            type: { type: "string" },
                            category: { type: "string" },
                            lane_id: { type: "string" },
                            next: {
                                oneOf: [
                                    { type: "object" },
                                    { type: "string" },
                                    { type: "null" }
                                ]
                            },
                            parameters: { type: "object" }
                        },
                        required: ["id", "name", "type", "lane_id", "next"]
                    },
                    minItems: 2
                }
            },
            additionalProperties: false,
            required: ["requirements", "prepare", "environment", "lanes", "nodes"]
        },
        additionalProperties: false,
        required: ["workflow_id", "name", "description", "blueprint_spec"]
    },
    additionalProperties: false,
    required: ["name", "description", "blueprint_spec"]
};
