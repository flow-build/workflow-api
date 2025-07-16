"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stateListSchema = exports.processListSchema = void 0;
exports.processListSchema = {
    type: "array",
    items: {
        type: "object",
        properties: {
            process_id: { type: "string", format: "uuid" },
            created_at: { type: "string", format: "date-time" },
            state_id: { type: "string", format: "uuid" },
            status: { type: "string" },
            workflow_name: { type: "string" },
            workflow_version: { type: "integer" }
        },
        required: ["process_id", "created_at", "state_id", "status", "workflow_name", "workflow_version"]
    }
};
exports.stateListSchema = {
    type: "array",
    items: {
        type: "object",
        properties: {
            workflow_name: { type: "string" },
            version: { type: "integer" },
            workflow_id: { type: "string", format: "uuid" },
            state_id: { type: "string", format: "uuid" },
            step_number: { type: "integer" },
            next_node_id: { type: "string", nullable: true },
            result: { type: "object" },
            status: { type: "string" },
            created_at: { type: "string", format: "date-time" }
        },
        required: ["created_at", "next_node_id", "result", "state_id", "status", "step_number", "version", "workflow_id", "workflow_name"]
    }
};
