module.exports = {
  type: "object",
  properties: {
    workflows: {
      type: "object",
      propertyNames: {
        type: "string",
        format: "uuid",
      },
      patternProperties: {
        ".": {
          type: "object",
          properties: {
            workflow_name: { type: "string" },
            workflow_description: { type: "string" },
            workflow_version: { type: "integer" },
          },
        },
      },
    },
  },
};
