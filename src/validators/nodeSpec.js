const { validateBodyWithSchema } = require("./base");

const nodeSchema = {
  type: "object",
  properties: {
    id: { type: 'string', format: 'uuid' },
    created_at: { type: 'string', format: 'date-time' },
    spec_name: { type: 'string' },
    node_lane_id: { type: 'string' },
    node_name: { type: 'string' },
    node_type: { type: 'string' },
    node_category: { type: 'string' },
    node_parameters: { type: 'object' }
  }
}

const validateNodeSchema = validateBodyWithSchema(nodeSchema)

module.exports = {
  validateNodeSchema
}