module.exports = {
  name: "filter_data",
  description: "workflow for testing filterDataNode",
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
              data: { type: "array" },
              key: { type: "string" },
              values: { type: "array" },
            },
            required: ["data", "key", "values"],
          },
        },
        lane_id: "1",
      },
      {
        id: "2",
        type: "systemTask",
        category: "filterData",
        name: "Filter Data",
        next: "3",
        lane_id: "1",
        parameters: {
          input: {
            data: { $ref: "bag.data" },
            key: { $ref: "bag.key" },
            values: { $ref: "bag.values" },
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
