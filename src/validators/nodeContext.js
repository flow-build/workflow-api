const { validateBodyWithSchema } = require("./base");

const contextSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    code: { type: 'string' },
    createdAt: { type: "string", format: "date-time" },
    name: { type: "string" },
    spec: { type: "string" },
    workflow: { type: "string" },
    parameters: { type: "object" },
    environment: { type: "object" },
    state: {
      type: 'object',
      properties: {
        result: { type: "object" },
        bag: { type: "object" },
        actor_data: { type: "object" },
        node_id: { type: "string" },
      },
      required: ['result','bag','actor_data']
    }
  },
  required: ['parameters','environment','state' ]
};

const validateContextSchema = validateBodyWithSchema(contextSchema);

module.exports = {
  validateContextSchema,
};
