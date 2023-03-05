module.exports = {
  name: "testTree",
  description: "test process dependency",
  blueprint_spec: {
    requirements: ["core"],
    prepare: [],
    nodes: [
      {
        id: "START",
        type: "Start",
        name: "Start node",
        parameters: {
          input_schema: {},
        },
        next: "START-PROCESS",
        lane_id: "1",
      },
      {
        id: "START-PROCESS",
        type: "SystemTask",
        category: "startProcess",
        name: "subprocess start",
        next: "LEAF",
        lane_id: "1",
        parameters: {
          workflow_name: "test_workflow",
          actor_data: { $ref: "actor_data" },
          input: {}
        }
      },
      {
        id: "LEAF",
        type: "SystemTask",
        category: "startProcess",
        name: "subprocess start",
        next: "SUB-PROCESS",
        lane_id: "1",
        parameters: {
          workflow_name: "testTreeLeaf",
          actor_data: { $ref: "actor_data" },
          input: {}
        }
      },
      {
        id: "SUB-PROCESS",
        type: "SubProcess",
        name: "subprocess start",
        next: "END",
        lane_id: "1",
        parameters: {
          workflow_name: "basic",
          valid_response: "finished",
          actor_data: { $ref: "actor_data" },
          input: {}
        }
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
        rule: ["fn", ["&", "args"], true],
      },
    ],
    environment: {},
  },
};
