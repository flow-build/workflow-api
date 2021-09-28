module.exports = {
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
      created_at: { type: "string", format: "date-time" },
    },
  },
};
