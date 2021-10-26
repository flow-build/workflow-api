const { validateBodyWithSchema } = require("./base");

module.exports.validateSetProcessState = validateBodyWithSchema({
  type: "object",
  properties: {
    next_node_id: { type: "string" },
    bag: { type: "object" },
    result: { type: "object" },
  },
  additionalProperties: false,
  required: ["next_node_id", "bag", "result"],
});
