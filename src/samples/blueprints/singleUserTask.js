module.exports = {
  name: "user_task",
  description: "user task workflow",
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
        type: "UserTask",
        name: "User Task node",
        next: "3",
        lane_id: "1",
        parameters: {
          action: "do something",
          input: {},
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
