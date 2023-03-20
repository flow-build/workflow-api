module.exports = {
  name: "timersTimeoutProcess",
  description: "Sample implementation of a process with expiration using timeout notation",
  blueprint_spec: {
    requirements: ["core"],
    prepare: [],
    nodes: [
      {
        id: "START",
        type: "Start",
        name: "Start process with expiration",
        next: "USERTASK",
        parameters: {
          input_schema: {},
          timeout: 10
        },
        lane_id: "1",
      },
      {
        id: "USERTASK",
        type: "UserTask",
        name: "User Task just to keep the process waiting until expiration",
        next: "END",
        lane_id: "1",
        parameters: {
          action: "just wait",
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
