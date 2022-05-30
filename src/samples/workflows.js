const basicStartFinish = {
  name: "basic",
  description: "system workflow",
  blueprint_spec: {
    requirements: ["core"],
    prepare: [],
    nodes: [
      {
        id: "1",
        type: "Start",
        name: "Start node",
        parameters: {
          input_schema: {},
        },
        next: "2",
        lane_id: "1",
      },
      {
        id: "2",
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

const singleUserTask = {
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
    environment: {
      KNEX_ENV: "KNEX_ENV"
    },
  },
};

const timerProcess = {
  name: "timer_process",
  description: "timer task workflow",
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
        category: "timer",
        name: "Timer node",
        next: "3",
        lane_id: "1",
        parameters: {
          input: {},
          timeout: 30,
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

const notifyUserTask = {
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
          activity_manager: "notify",
          action: "notify something",
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
          input: {},
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

const customNode = {
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

const scriptNode = {
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

const invalidMissingNode = {
  name: "invalidMissingNode",
  description: "invalid blueprint, missing one node",
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

const invalidMissingLane = {
  name: "invalidMissingLane",
  description: "invalid blueprint, lane #2 does not exist",
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
        type: "systemTask",
        category: "setToBag",
        name: "set to bag generic",
        next: "3",
        lane_id: "2",
        parameters: {},
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

const invalidWrongNode = {
  name: "invalidWrongNode",
  description: "invalid blueprint, a non-existant node type",
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
        type: "wrongNode",
        category: "setToBag",
        name: "set to bag generic",
        next: "3",
        lane_id: "1",
        parameters: {},
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

const invalidDuplicatedNode = {
  name: "invalidDuplicatedNode",
  description: "invalid blueprint, there are two #2 nodes",
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
        type: "systemTask",
        category: "setToBag",
        name: "set to bag generic",
        next: "3",
        lane_id: "1",
        parameters: {},
      },
      {
        id: "2",
        type: "systemTask",
        category: "setToBag",
        name: "set to bag generic",
        next: "3",
        lane_id: "1",
        parameters: {},
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

const invalidDuplicatedLane = {
  name: "invalidDuplicatedLane",
  description: "invalid blueprint, there are two #1 lanes",
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
        type: "systemTask",
        category: "setToBag",
        name: "set to bag generic",
        next: "3",
        lane_id: "1",
        parameters: {},
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
      {
        id: "1",
        name: "the_only_lane",
        rule: ["fn", ["&", "args"], true],
      },
    ],
    environment: {},
  },
};

module.exports = {
  basicStartFinish,
  timerProcess,
  singleUserTask,
  notifyUserTask,
  customNode,
  scriptNode,
  invalidMissingNode,
  invalidMissingLane,
  invalidWrongNode,
  invalidDuplicatedNode,
  invalidDuplicatedLane,
};
