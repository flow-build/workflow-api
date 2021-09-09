module.exports = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    process_id: { type: "string", format: "uuid" },
    step_number: { type: "integer" },
    node_id: { type: "string" },
    //next_node_id: { type: "string" },
    bag: { type: "object" },
    external_input: { type: "null" },
    result: { type: "object" },
    error: { oneOf: [{ type: "null" }, { type: "string" }] },
    status: { type: "string" },
    created_at: { type: "string", format: "date-time" },
    actor_data: { type: "object" },
    engine_id: { type: "string", format: "uuid" },
    time_elapsed: { oneOf: [{ type: "null" }, { type: "string" }] },
  },
};
