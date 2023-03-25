module.exports = {
  name: "kafkaTest",
  description: "Sample implementation of process with a kafka publish node",
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
        name: "Set message, topic and event",
        next: "KAFKA",
        type: "SystemTask",
        lane_id: "1",
        category: "setToBag",
        parameters: {
          input: {
            message: {
              hello: "world",
              some: "data",
            },
            topic: "mt-topic",
            event: "sample blueprint"
          },
        },
      },
      {
        id: "KAFKA",
        type: "SystemTask",
        category: "kafkaPublish",
        name: "kafka publish node",
        next: "END",
        lane_id: "1",
        parameters: {
          input: {
            message: { $ref: 'bag.message' },
            topic: { $ref: 'bag.topic' },
            event: { $ref: 'bag.event' }
          }
        },
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
