"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processListSchema = void 0;
exports.processListSchema = {
    type: "object",
    properties: {
        workflow_name: {
            oneOf: [
                { type: "string" },
                { type: "array", items: { type: "string" } }
            ],
            nullable: true
        },
        workflow_id: {
            oneOf: [
                { type: "string", format: "uuid" },
                { type: "array", items: { type: "string", format: "uuid" } }
            ],
            nullable: true
        },
        process_id: {
            oneOf: [
                { type: "string", format: "uuid" },
                { type: "array", items: { type: "string", format: "uuid" } }
            ],
            nullable: true
        },
        current_status: {
            oneOf: [
                { type: "string" },
                { type: "array", items: { type: "string" } }
            ],
            nullable: true
        },
        limit: { type: "integer", nullable: true },
        offset: { type: "integer", nullable: true }
    }
};
