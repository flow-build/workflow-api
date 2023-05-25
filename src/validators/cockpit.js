const { validateBodyWithSchema } = require("./base");

const validateSetProcessState = validateBodyWithSchema({
  type: "object",
  properties: {
    next_node_id: { type: "string" },
    bag: { type: "object" },
    result: { type: "object" },
  },
  additionalProperties: false,
  required: ["next_node_id", "bag", "result"],
})

const validateFetchNodeSchema = validateBodyWithSchema({
  type: 'object',
  required: ['type'],
  properties: {
    type: { type: 'string' },
    category: { type: 'string' }
  },
  additionalProperties: false
})

const validateEnvironmentSchema = validateBodyWithSchema({
  type: "object",
  properties: {
    key: { type: "string" },
    value: { type: ["string", "number", "boolean"] },
  },
  required: ["key", "value"],
})

module.exports = {
  validateSetProcessState,
  validateFetchNodeSchema,
  validateEnvironmentSchema,
};
