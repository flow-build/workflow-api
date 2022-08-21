module.exports = {
  name: "create_uuid",
  description: "workflow for testing create uuid node",
  blueprint_spec: {
    requirements: ["core"],
    prepare: [],
    nodes: [
      {
        id: "0",
        type: "Start",
        name: "Start node",
        next: "v1",
        parameters: {
          input_schema: {},
        },
        lane_id: "free",
      },
      {
        id: "v1",
        type: "systemTask",
        category: "createUuid",
        name: "UUID v1",
        next: "v3",
        lane_id: "free",
        parameters: {
          input: {
            type: "uuid",
            options: { 
              version: "v1" 
            },
          },
        },
      },
      {
        id: "v3",
        type: "systemTask",
        category: "createUuid",
        name: "UUID v3",
        next: "v4",
        lane_id: "free",
        parameters: {
          input: {
            type: "uuid",
            options: { 
              version: "v3" 
            },
          },
        },
      },
      {
        id: "v4",
        type: "systemTask",
        category: "createUuid",
        name: "UUID v5",
        next: "v5",
        lane_id: "free",
        parameters: {
          input: {
            type: "uuid",
            options: { 
              version: "v4" 
            },
          },
        },
      },
      {
        id: "v5",
        type: "systemTask",
        category: "createUuid",
        name: "UUID v5",
        next: "nano",
        lane_id: "free",
        parameters: {
          input: {
            type: "uuid",
            options: { 
              version: "v5" 
            },
          },
        },
      },
      {
        id: "nano",
        type: "systemTask",
        category: "createUuid",
        name: "UUID v5",
        next: "nano10",
        lane_id: "free",
        parameters: {
          input: {
            type: "nanoid"
          },
        },
      },
      {
        id: "nano10",
        type: "systemTask",
        category: "createUuid",
        name: "UUID v5",
        next: "end",
        lane_id: "free",
        parameters: {
          input: {
            type: "nanoid",
            options: {
              size: 10
            }
          },
        },
      },
      {
        id: "end",
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
