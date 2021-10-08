const nodeSchema = {
  start: {
    type: "object",
    properties: {
      parameters: {
        type: "object",
        properties: {
          input_schema: { type: "object" },
        },
      },
    },
  },
  systemtask: {
    type: "object",
    properties: {
      category: { type: "string" },
      parameters: {
        type: "object",
        properties: {
          input: { type: "object" },
        },
      },
    },
    required: ["category", "parameters"],
  },
  finish: {
    type: "object",
    properties: {
      next: { type: "null" },
    },
  },
  flow: {
    type: "object",
    properties: {
      next: {
        type: "object",
        properties: {
          default: { type: "string" },
        },
        required: ["default"],
        additionalProperties: { type: "string" },
      },
      parameters: {
        type: "object",
        minProperties: 1,
        maxProperties: 1,
      },
    },
  },
  usertask: {
    type: "object",
    properties: {
      parameters: {
        type: "object",
        properties: {
          action: { type: "string" },
          encrypted_data: {
            type: "array",
            items: { type: "string" },
          },
          channels: {
            type: "array",
            items: { type: "string" },
          },
          activity_manager: {
            type: "string",
            enum: ["commit", "notify"],
          },
          activity_schema: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["object"] },
              properties: { type: "object" },
              required: {
                type: "array",
                items: { type: "string" },
              },
              additionalProperties: {
                oneOf: [{ type: "boolean" }, { type: "object" }],
              },
            },
          },
        },
        required: ["action"],
      },
    },
  },
  subprocess: {
    type: "object",
    properties: {
      parameters: {
        type: "object",
        properties: {
          actor_data: {
            type: "object",
          },
          workflow_name: { type: "string" },
          valid_response: { type: "string" },
          input: {
            type: "object",
          },
        },
        required: ["actor_data", "workflow_name"],
      },
    },
  },
  scripttask: {
    type: "object",
    properties: {
      parameters: {
        type: "object",
        properties: {
          script: {
            type: "object",
            properties: {
              function: { type: "string" },
              args: { type: "object" },
            },
            required: ["function", "args"],
          },
        },
        required: ["script"],
      },
    },
  },
};

const categorySchema = {
  settobag: {
    type: "object",
  },
  http: {
    type: "object",
    properties: {
      request: {
        type: "object",
        properties: {
          url: { oneOf: [{ type: "string" }, { type: "object" }] },
          verb: {
            type: "string",
            enum: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"],
          },
          header: { type: "object" },
          timeout: { type: "number" },
          max_content_length: { type: "number" },
        },
        required: ["url", "verb"],
      },
      valid_response_codes: { type: "array" },
    },
  },
  timer: {
    type: "object",
    properties: {
      timeout: { type: "number" },
    },
    required: ["timeout"],
    additionalProperties: false,
  },
  startprocess: {
    type: "object",
    properties: {
      workflow_name: {
        oneOf: [{ type: "string" }, { type: "object" }],
        actor_data: { type: "object" },
      },
      required: ["workflow_name", "actor_data"],
    },
  },
  abortprocess: {
    type: "object",
    properties: {
      process_id: { type: "string", format: "uuid" },
    },
    required: ["process_id"],
  },
};

module.exports = {
  nodeSchema,
  categorySchema,
};
