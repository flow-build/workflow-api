const { validateBodyWithSchema } = require("./base");

const nodeSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    createdAt: { type: "string", format: "date-time" },
    name: { type: "string" },
    element: {
      type: "string",
      enum: ["servicetask", "startevent", "endevent", "exclusivegateway", "usertask", "intermediatecatchevent"],
    },
    node: {
      type: 'object',
      properties: {
        laneId: { type: "string" },
        name: { type: "string" },
        type: {
          type: "string",
          enum: ["start", "finish", "flow", "scripttask", "usertask", "systemtask", "subprocess"],
        },
        category: { type: "string" },
        parameters: { type: "object" },
      },
      required: ['type','parameters','name']
    }
  },
  required: ['name','element','node' ]
};

const validateNodeSchema = validateBodyWithSchema(nodeSchema);

module.exports = {
  validateNodeSchema,
};
