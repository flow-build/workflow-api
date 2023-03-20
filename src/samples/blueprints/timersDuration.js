module.exports = {
  name: "timersDuration",
  description: "Sample implementation of timers using duration notation",
  blueprint_spec: {
    requirements: ["core"],
    prepare: [],
    nodes: [
      {
        id: "START",
        type: "Start",
        name: "Start node",
        next: "CONFIG",
        parameters: {
          input_schema: {},
        },
        lane_id: "1",
      },
      {
        id: "CONFIG",
        name: "Set DueDate",
        next: "TIMER",
        type: "SystemTask",
        lane_id: "1",
        category: "setToBag",
        parameters: {
          input: {
            date1: "PT6S",
          },
        },
      },
      {
        id: "TIMER",
        type: "SystemTask",
        category: "timer",
        name: "Intermediate Event Timer with duration notation",
        next: "USERTASK",
        lane_id: "1",
        parameters: {
          input: {},
          duration: "PT4S",
        },
      },
      {
        id: "USERTASK",
        type: "UserTask",
        name: "User Task with boundary event, duration notation & $ref",
        next: "END",
        lane_id: "1",
        parameters: {
          action: "do something",
          input: {},
        },
        events: [
          {
            family: "target",
            category: "timer",
            duration: { $ref: "bag.date1" },
          },
        ],
      },
      {
        id: "END",
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
        rule: { $js: "() => true" },
      },
    ],
    environment: {},
  },
};
