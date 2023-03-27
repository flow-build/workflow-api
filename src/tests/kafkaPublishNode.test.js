require("dotenv").config();
const _ = require('lodash')
const KafkaPublishNode = require("../nodes/kafkaPublishNode");
const kafkaBroker = require('../services/broker/kafka');

const nodeSchema = {
  id: "1",
  name: "rightSchema",
  next: "2",
  lane_id: "any",
  type: "systemTask",
  category: "kafkaPublish",
  parameters: {
    input: {
      message: { foo: "bar" },
      event: "myCreatedEvent",
      topic: "mt-topic",
    },
  },
};

const executionDataExample = {
  message: {
    id: 1,
    date: "01/01/2005",
    user: { name: "test" },
  },
  event: "myBagRefEvent",
  topic: "mt-topic",
};

beforeAll(async () => {
  await kafkaBroker.connect();
});

afterAll(async () => {
  kafkaBroker.disconnect()
})

describe("schema validation", () => {
  test("should accept a correct node schema", async () => {
    const myNode = new KafkaPublishNode(nodeSchema);
    const [validation, errors] = myNode.validate();
    expect(validation).toBeTruthy();
    expect(errors).toBe("null");
  });

  test("should accept $ref", async () => {
    const refSchema = {
      id: "1",
      name: "rightSchema",
      next: "2",
      lane_id: "any",
      type: "systemTask",
      category: "remapData",
      parameters: {
        input: {
          message: { $ref: "bag.message" },
          event: { $ref: "bag.event" },
          topic: { $ref: "bag.topic" },
        },
      },
    };

    const myNode = new KafkaPublishNode(refSchema);
    const [validation, errors] = myNode.validate();
    expect(validation).toBeTruthy();
    expect(errors).toBe("null");
  });

  test("should require event", async () => {
    const schema = _.cloneDeep(nodeSchema);
    delete schema.parameters.input.event;

    const node = new KafkaPublishNode(schema);
    const [validation, errors] = node.validate();
    expect(validation).toBeFalsy();
    expect(errors).toBeDefined();
  });

  test("should require topic", async () => {
    const schema = _.cloneDeep(nodeSchema);
    delete schema.parameters.input.topic;

    const myNode = new KafkaPublishNode(schema);
    const [validation, errors] = myNode.validate();
    expect(validation).toBeFalsy();
    expect(errors).toBeDefined();
  });
});

describe("executionData validation", () => {
  test("should accept a correct executionData", async () => {
    const [validation, errors] = KafkaPublishNode.validateExecutionData(executionDataExample);
    expect(validation).toBeTruthy();
    expect(errors).toBe("null");
  });

  test("should NOT accept $ref", async () => {
    const refExecutionData = {
      message: { $ref: "bag.message" },
      event: { $ref: "bag.event" },
      topic: { $ref: "bag.topic" },
    };

    const [validation, errors] = KafkaPublishNode.validateExecutionData(refExecutionData);
    expect(validation).toBeFalsy();
    expect(JSON.parse(errors)).toBeDefined();
  });

  test("should require topic", async () => {
    const executionData = _.cloneDeep(executionDataExample);
    delete executionData.topic;

    const [validation, errors] = KafkaPublishNode.validateExecutionData(executionData);
    expect(validation).toBeFalsy();
    expect(JSON.parse(errors)).toBeDefined();
  });

  test("should require event", async () => {
    const executionData = _.cloneDeep(executionDataExample);
    delete executionData.event;

    const [validation, errors] = KafkaPublishNode.validateExecutionData(executionData);
    expect(validation).toBeFalsy();
    expect(JSON.parse(errors)).toBeDefined();
  });
});

describe("run node", () => {
  const nodeExampleSuccess = {
    id: "1",
    name: "rightSchema",
    next: "2",
    lane_id: "any",
    type: "systemTask",
    category: "kafkaPublish",
    parameters: {
      input: {
        message: { foo: "bar" },
        event: "myCreatedEvent",
        topic: "mt-topic",
      },
    },
  };

  test("should work", async () => {
    const myNode = new KafkaPublishNode(nodeExampleSuccess);
    const nodeResult = await myNode.run({});
    expect(nodeResult.status).toBe("running");
    expect(nodeResult.result).toBeTruthy();
  });
});
