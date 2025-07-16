"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processExecutionSchema = void 0;
exports.processExecutionSchema = {
    type: "array",
    items: {
        type: "object",
        properties: {
            state_id: { type: "string", format: "uuid" },
            step_number: { type: "integer" },
            node_type: { type: "string" },
            node: { type: "string" },
            next_node_id: { anyOf: [{ type: "string" }, { type: "null" }] },
            status: { type: "string" }
        },
        required: ["state_id", "step_number", "node_type", "node", "status"]
    }
};
