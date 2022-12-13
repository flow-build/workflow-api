module.exports = {
  name: "deepCompareNode_example",
  description: "workflow for testing Deep Compare node",
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
        lane_id: "free",
      },
      {
        id: 'CONFIG',
        name: 'Configure Bag',
        type: 'systemTask',
        category: "setToBag",
        next: 'DEEP-COMPARE-1',
        lane_id: 'free',
        parameters: {
          input: {
            base: [
              { id: 1, firstField: "a", secondField: "b" },
              { id: 2, firstField: "c", secondField: "d" },
              { id: 3, firstField: "e", secondField: "f" },
            ],
            candidate: [
              { id: 2, firstField: "c", secondField: "d" },
              { id: 3, firstField: "i", secondField: "j" },
              { id: 4, firstField: "g", secondField: "h" },
            ],
            commonKeys: ["id"],
            ignoreKeys: ["secondField"],
          }
        }
      },
      {
        id: "DEEP-COMPARE-1",
        type: "SystemTask",
        category: "deepCompare",
        name: "Success Case",
        next: "DEEP-COMPARE-2",
        lane_id: "free",
        parameters: {
          input: {
            base: { $ref: "bag.base" },
            candidate: { $ref: "bag.candidate" },
            commonKeys: { $ref: "bag.commonKeys" },
            baignoreKeysse: { $ref: "bag.ignoreKeys" },
          },
        },
      },
      {
        id: "DEEP-COMPARE-2",
        type: "SystemTask",
        category: "deepCompare",
        name: "Conflict at Base",
        next: "DEEP-COMPARE-3",
        lane_id: "free",
        parameters: {
          input: {
            base: [
              { id: 1, firstField: "a", secondField: "b" },
              { id: 1, firstField: "x", secondField: "y" },
              { id: 2, firstField: "c", secondField: "d" },
              { id: 3, firstField: "e", secondField: "f" },
            ],
            candidate: { $ref: "bag.candidate" },
            commonKeys: { $ref: "bag.commonKeys" },
            baignoreKeysse: { $ref: "bag.ignoreKeys" },
          },
        },
      },
      {
        id: "DEEP-COMPARE-3",
        type: "SystemTask",
        category: "deepCompare",
        name: "Conflict at Candidate",
        next: "END",
        lane_id: "free",
        parameters: {
          input: {
            base: { $ref: "bag.base" },
            candidate: [
              { id: 2, firstField: "c", secondField: "d" },
              { id: 2, firstField: "x", secondField: "y" },
              { id: 3, firstField: "i", secondField: "j" },
              { id: 4, firstField: "g", secondField: "h" },
            ],
            commonKeys: { $ref: "bag.commonKeys" },
            baignoreKeysse: { $ref: "bag.ignoreKeys" },
          },
        },
      },
      {
        id: "END",
        type: "Finish",
        name: "Finish node",
        next: null,
        lane_id: "free",
      },
    ],
    lanes: [
      {
        id: "free",
        name: "the_only_lane",
        rule: ["fn", ["&", "args"], true],
      },
    ],
    environment: {},
  },
};
