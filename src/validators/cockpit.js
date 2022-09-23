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

module.exports = {
  validateSetProcessState,
  validateFetchNodeSchema
};
