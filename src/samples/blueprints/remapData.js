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
            required: ["data", "dictionary"],
            properties: {
              data: { type: "array" },
              dictionary: { type: "object" },
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
            data: {
              $ref: "bag.data"
            },
            dictionary: {
              $ref: "bag.dictionary"
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
