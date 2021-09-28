module.exports = {
  type: "array",
  items: {
    type: "object",
    properties: {
      process_id: { type: "string", format: "uuid" },
      created_at: { type: "string", format: "date-time" },
      state_id: { type: "string", format: "uuid" },
      status: { type: "string" },
      workflow_name: { type: "string" },
      workflow_version: { type: "integer" },
    },
  },
};
