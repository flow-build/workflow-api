module.exports = {
  name: "timersTimeout",
  description: "Sample implementation of timers using timeout notation",
  blueprint_spec: {
    requirements: ["core"],
    prepare: [],
    nodes: [
      {
        id: "START",
        type: "Start",
        name: "Start process",
        next: "TIMER",
        parameters: {
          input_schema: {},
        },
        lane_id: "1",
      },
      {
        id: "TIMER",
        type: "SystemTask",
        category: "timer",
        name: "Intermediate Event Timer with timeout notation",
        next: "USERTASK",
        lane_id: "1",
        parameters: {
          input: {},
          timeout: 5,
        },
      },
      {
        id: "USERTASK",
        type: "UserTask",
        name: "User Task with timeout notation",
        next: "END",
        lane_id: "1",
        parameters: {
          action: "do something",
          timeout: 6,
          input: {},
        },
      },
      {
        id: "END",
        type: "Finish",
        name: "Finish process",
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
