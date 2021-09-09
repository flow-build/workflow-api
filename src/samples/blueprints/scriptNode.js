module.exports = {
  name: "user_script_task workflow",
  description: "function lisp workflow",
  blueprint_spec: {
    requirements: ["core", "test_package"],
    prepare: [
      "do",
      ["def", "test_function", ["fn", ["&", "args"], { new_bag: "New Bag" }]],
      null,
    ],
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
        type: "ScriptTask",
        name: "Service node",
        next: "3",
        lane_id: "1",
        parameters: {
          input: {},
          script: {
            function: ["fn", ["&", "args"], ["test_function"]],
          },
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
          input: {},
        },
      },
      {
        id: "4",
        type: "SystemTask",
        category: "SetToBag",
        name: "Set to bag node",
        next: "5",
        lane_id: "1",
        parameters: {
          input: {
            any: { $ref: "result.any" },
          },
        },
      },
      {
        id: "5",
        type: "Finish",
        name: "Finish node",
        next: null,
        lane_id: "1",
      },
    ],
    lanes: [
      {
        id: "1",
        name: "simpleton",
        rule: ["fn", ["&", "args"], true],
      },
    ],
    environment: {},
  },
};
