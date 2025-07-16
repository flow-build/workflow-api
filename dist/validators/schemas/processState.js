"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processStateSchema = void 0;
exports.processStateSchema = {
    type: "object",
    properties: {
        id: { type: "string", format: "uuid" },
        process_id: { type: "string", format: "uuid" },
        step_number: { type: "integer" },
        node_id: { type: "string" },
        next_node_id: {
            oneOf: [{ type: "null" }, { type: "string" }]
        },
        bag: { type: "object" },
        external_input: {
            oneOf: [{ type: "null" }, { type: "string" }]
        },
        result: { type: "object" },
        error: { oneOf: [{ type: "null" }, { type: "string" }] },
        status: { type: "string" },
        created_at: { type: "string", format: "date-time" },
        actor_data: { type: "object" },
        engine_id: { type: "string", format: "uuid" },
        time_elapsed: {
            oneOf: [{ type: "null" }, { type: "string" }]
        }
    },
    required: [
        "id",
        "process_id",
        "step_number",
        "node_id",
        "next_node_id",
        "bag",
        "external_input",
        "result",
        "error",
        "status",
        "created_at",
        "actor_data",
        "engine_id",
        "time_elapsed"
    ]
};
