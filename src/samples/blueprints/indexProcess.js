module.exports = {
  name: "index_process",
  description: "workflow for testing indexNode",
  blueprint_spec: {
    requirements: ["core"],
    prepare: [],
    nodes: [
      {
        id: "1",
        type: "Start",
        name: "Start node",
        next: "2",
        parameters: {
          input_schema: {
            type: "object",
            properties: {
              entity_type: { type: "string" },
              entity_id: { type: "string" },
            },
            required: ["entity_type", "entity_id"],
          },
        },
        lane_id: "1",
      },
      {
        id: "2",
        type: "systemTask",
        category: "createIndex",
        name: "Index Process",
        next: "3",
        lane_id: "1",
        parameters: {
          input: {
            entity_type: { $ref: "bag.entity_type" },
            entity_id: { $ref: "bag.entity_id" },
          },
        },
      },
      {
        id: "3",
        type: "Finish",
        name: "Finish node",
        next: null,
        lane_id: "1",
      },
    ],
    lanes: [
      {
        id: "1",
        name: "the_only_lane",
        rule: ["fn", ["&", "args"], true],
      },
    ],
    environment: {},
  },
};
