module.exports = {
  name: "remap_data",
  description: "workflow for testing remap data node",
  blueprint_spec: {
    requirements: ["core"],
    prepare: [],
    nodes: [
      {
        id: "START",
        type: "Start",
        name: "Start node",
        next: "REMAP_DATA",
        parameters: {
          input_schema: {
            type: "object",
            required: ["origin_array", "remap_schema"],
            properties: {
              origin_array: { type: "array" },
              remap_schema: { type: "object" },
            }
          },
        },
        lane_id: "free",
      },
      {
        id: "REMAP_DATA",
        type: "SystemTask",
        category: "remapData",
        name: "Remap Data",
        next: "END",
        lane_id: "free",
        parameters: {
          input: {
            origin_array: {
              $ref: "bag.origin_array"
            },
            remap_schema: {
              $ref: "bag.remap_schema"
            }
          },
        },
      },
      {
        id: "END",
        type: "Finish",
        name: "Finish node",
        next: null,
        lane_id: "free",
      },
    ],
    lanes: [
      {
        id: "free",
        name: "the_only_lane",
        rule: ["fn", ["&", "args"], true],
      },
    ],
    environment: {},
  },
};
