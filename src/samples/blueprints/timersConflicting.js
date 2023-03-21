module.exports = {
  name: "timerConflicting",
  description: "Process that expires before the userTask timer run out",
  blueprint_spec: {
    requirements: ["core"],
    prepare: [],
    nodes: [
      {
        id: "START",
        type: "Start",
        name: "Start process",
        next: "USERTASK",
        parameters: {
          input_schema: {},
          timeout: 5
        },
        lane_id: "1",
      },
      {
        id: "USERTASK",
        type: "UserTask",
        name: "UserTask with higher duration",
        next: "END",
        lane_id: "1",
        parameters: {
          action: "do something",
          input: {},
          timeout: 10
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
