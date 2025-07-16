"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categorySchema = exports.nodeSchema = void 0;
const jsFunctionSchema = {
    type: "object",
    properties: {
        $js: { type: "string" }
    },
    required: ["$js"]
};
const startNodeSchema = {
    type: "object",
    properties: {
        parameters: {
            type: "object",
            properties: {
                input_schema: { type: "object", nullable: true },
                timeout: { type: "integer", nullable: true },
                duration: { type: "string", nullable: true }
            }
        }
    },
    required: ["parameters"]
};
const systemTaskNodeSchema = {
    type: "object",
    properties: {
        category: { type: "string" },
        parameters: {
            type: "object",
            properties: {
                input: { type: "object" }
            },
            required: ["input"]
        }
    },
    required: ["category", "parameters"]
};
const finishNodeSchema = {
    type: "object",
    properties: {
        next: { type: "null" }
    },
    required: ["next"]
};
const flowNodeSchema = {
    type: "object",
    properties: {
        next: {
            type: "object",
            properties: {
                default: { type: "string" }
            },
            required: ["default"],
            additionalProperties: true
        },
        parameters: {
            type: "object",
            minProperties: 1,
            maxProperties: 1
        }
    },
    required: ["next", "parameters"]
};
const userTaskNodeSchema = {
    type: "object",
    properties: {
        parameters: {
            type: "object",
            properties: {
                action: { type: "string" },
                encrypted_data: { type: "array", items: { type: "string" }, nullable: true },
                channels: { type: "array", items: { type: "string" }, nullable: true },
                activity_manager: { type: "string", enum: ["commit", "notify"], nullable: true },
                activity_schema: {
                    type: "object",
                    properties: {
                        type: { type: "string", enum: ["object"] },
                        properties: { type: "object" },
                        required: { type: "array", items: { type: "string" } },
                        additionalProperties: {
                            oneOf: [{ type: "boolean" }, { type: "object" }]
                        }
                    },
                    required: ["type", "properties", "required", "additionalProperties"],
                    nullable: true
                }
            },
            required: ["action"]
        }
    },
    required: ["parameters"]
};
const subprocessNodeSchema = {
    type: "object",
    properties: {
        parameters: {
            type: "object",
            properties: {
                actor_data: {
                    type: "object"
                },
                workflow_name: {
                    oneOf: [{ type: "string" }, { type: "object" }]
                },
                valid_response: { type: "string" },
                input: {
                    type: "object"
                }
            },
            required: ["actor_data", "workflow_name"]
        }
    },
    required: ["parameters"]
};
const scriptNodeSchema = {
    type: "object",
    properties: {
        parameters: {
            type: "object",
            properties: {
                script: {
                    type: "object",
                    properties: {
                        function: { type: "string" },
                        args: { type: "object" }
                    },
                    required: ["function", "args"]
                }
            },
            required: ["script"]
        }
    },
    required: ["parameters"]
};
exports.nodeSchema = {
    start: startNodeSchema,
    systemtask: systemTaskNodeSchema,
    finish: finishNodeSchema,
    flow: flowNodeSchema,
    usertask: userTaskNodeSchema,
    subprocess: subprocessNodeSchema,
    scripttask: scriptNodeSchema
};
const httpNodeSchema = {
    type: "object",
    properties: {
        request: {
            type: "object",
            properties: {
                url: {
                    oneOf: [{ type: "string" }, jsFunctionSchema]
                },
                verb: {
                    type: "string",
                    enum: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]
                },
                header: { type: "object", nullable: true },
                timeout: {
                    oneOf: [{ type: "number" }, jsFunctionSchema]
                },
                max_content_length: {
                    oneOf: [{ type: "number" }, jsFunctionSchema]
                }
            },
            required: ["url", "verb"]
        },
        valid_response_codes: { type: "array", items: { type: "string" }, nullable: true }
    },
    required: ["request"]
};
const settobagNodeSchema = {
    type: "object",
    properties: {
        settobag: jsFunctionSchema
    },
    required: ["settobag"]
};
const timerNodeSchema = {
    type: "object",
    properties: {
        timeout: {
            oneOf: [{ type: "number" }, jsFunctionSchema]
        },
        input: { type: "object" }
    },
    required: ["input"]
};
const startProcessNodeSchema = {
    type: "object",
    properties: {
        workflow_name: {
            oneOf: [{ type: "string" }, jsFunctionSchema]
        },
        actor_data: { type: "object" }
    },
    required: ["workflow_name", "actor_data"]
};
const abortProcessNodeSchema = {
    type: "object",
    properties: {
        process_id: { type: "string", format: "uuid" }
    },
    required: ["process_id"]
};
exports.categorySchema = {
    settobag: settobagNodeSchema,
    http: httpNodeSchema,
    timer: timerNodeSchema,
    startprocess: startProcessNodeSchema,
    abortprocess: abortProcessNodeSchema
};
