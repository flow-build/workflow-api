"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processStateFromNodeSchema = void 0;
exports.processStateFromNodeSchema = {
    type: "array",
    items: {
        type: "object",
        properties: {
            workflow_name: { type: "string" },
            version: { type: "integer" },
            workflow_id: { type: "string", format: "uuid" },
            state_id: { type: "string", format: "uuid" },
            step_number: { type: "integer" },
            next_node_id: { type: "string" },
            result: { type: "object" },
            status: { type: "string" },
            created_at: { type: "string", format: "date-time" }
        },
        required: [
            "workflow_name",
            "version",
            "workflow_id",
            "state_id",
            "step_number",
            "next_node_id",
            "result",
            "status",
            "created_at"
        ]
    }
};
