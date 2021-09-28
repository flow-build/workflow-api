module.exports = {
  name: "custom node workflow",
  description: "custom workflow",
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
          input_schema: {},
        },
        lane_id: "1",
      },
      {
        id: "2",
        type: "SystemTask",
        category: "CustomTask",
        name: "Custom task",
        next: "3",
        lane_id: "1",
        parameters: {
          input: {},
        },
      },
      {
        id: "3",
        type: "UserTask",
        name: "User Task node",
        next: "4",
        lane_id: "1",
        parameters: {
          action: "do something",
          input: {
            internal_key: "result.custom_data",
            outr: 'valor',
            qualqer: 'coisa'
          },
        },
      },
      {
        id: "4",
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
