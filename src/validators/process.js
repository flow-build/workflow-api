const { validateBodyWithSchema } = require("./base");

const validateRunProcess = validateBodyWithSchema(
  {
    type: "object"
  });

const validateSetProcessState = validateBodyWithSchema(
  {
    type: "object",
    properties: {
      process_state: {
        type: "object",
        properties: {
          step_number: { type: "integer" },
          node_id: { type: "string" },
          next_node_id: { type: "string" },
          bag: { type: "object" },
          external_input: { type: "object" },
          result: { type: "object" },
          error: { type: "string" },
          status: { type: "string" }
        },
        additionalProperties: false,
        required: [ "step_number", "node_id", "next_node_id", "bag",
                    "external_input", "result", "error", "status" ]
      }
    },
    additionalProperties: false,
    required: [ "process_state" ]
  });

module.exports = {
  runProcess: validateRunProcess,
  setProcessState: validateSetProcessState
};
