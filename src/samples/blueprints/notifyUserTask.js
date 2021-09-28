module.exports = {
  name: "notify_task",
  description: "user notify task workflow",
  blueprint_spec: {
    requirements: [],
    prepare: [],
    nodes: [
      {
        id: "1",
        type: "Start",
        name: "Start node",
        next: "2N",
        parameters: {
          input_schema: {},
        },
        lane_id: "1",
      },
      {
        id: "2N",
        type: "UserTask",
        name: "User Task node",
        next: "3X",
        lane_id: "1",
        parameters: {
          activity_manager: "notify",
          action: "notify something",
          input: {},
        },
      },
      {
        id: "3X",
        type: "UserTask",
        name: "User Task node",
        next: "4E",
        lane_id: "1",
        parameters: {
          action: "do something",
          input: {},
        },
      },
      {
        id: "4E",
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
