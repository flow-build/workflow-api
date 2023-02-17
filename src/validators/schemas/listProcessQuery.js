module.exports = {
  type: "object",
  unevaluatedProperties: false,
  properties: {
    workflow_name: {
      oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
    },
    workflow_id: {
      oneOf: [
        { type: "string", format: "uuid" },
        { type: "array", items: { type: "string", format: "uuid" } },
      ],
    },
    process_id: {
      oneOf: [
        { type: "string", format: "uuid" },
        { type: "array", items: { type: "string", format: "uuid" } },
      ],
    },
    current_status: {
      oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
    },
    limit: { type: "integer" },
    offset: { type: "integer" },
  },
}