module.exports = {
  name: "timerConflicting2",
  description: "Process that expires before the intermediate timer run out",
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
          timeout: 5
        },
        lane_id: "1",
      },
      {
        id: "TIMER",
        type: "SystemTask",
        category: "timer",
        name: "Timer node with higher duration than process",
        next: "END",
        lane_id: "1",
        parameters: {
          input: {},
          duration: "PT10S",
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
        rule: { $js: "() => true" },
      },
    ],
    environment: {},
  },
};
