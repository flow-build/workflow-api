require("dotenv").config();
const broker = require("../services/broker/index");
const { getClient } = require("../services/broker/mqtt");
const { getChannel } = require("../services/broker/rabbitMQ");

describe.skip("MQTT Broker Tests", () => {
  beforeAll(async () => {
    process.env.MQTT = "true";
    process.env.AMQP = "false";
    process.env.ACTIVITY_MANAGER_BROKER = "MQTT";
    process.env.PROCESS_STATE_BROKER = "MQTT";
  });

  test("should handle AM messages with MQTT", async () => {
    const topic = "am_test_mqtt";
    const message = {
      process_id: "085e8152-ca3d-4835-8b36-ba703864a447",
      id: "cd1d350e-c26b-11ed-afa1-0242ac120002",
      status: "started",
      props: {},
    };

    await broker.connect();
    const client = getClient();
    await client.subscribe(topic);
    await broker.publishMessage({ topic, message }, process.env.ACTIVITY_MANAGER_BROKER);

    const { topicSent, messageSentBuffer } = await new Promise(resolve => {
      client.on("message", (topicSent, messageSentBuffer) => {
        resolve({topicSent, messageSentBuffer});
      });
    });

    const messageSent = Buffer.from(messageSentBuffer).toString("utf-8");
    expect(topic).toEqual(topicSent);
    expect(message).toMatchObject(JSON.parse(messageSent));
  });

  test("should handle PS messages with MQTT", async () => {
    const topic = "ps_test_mqtt";
    const message = {
      stateId: "70e8f12c-54dd-4dd6-9837-61cf489ef0f8",
      processId: "47ecd830-1463-416e-aa36-953e0f607e28",
      stepNumber: 3,
      nodeId: "SET-TO-BAG",
      status: "running",
      workflow: "workflowTest",
      result: {}
    };

    await broker.connect();
    const client = getClient();
    await client.subscribe(topic);
    await broker.publishMessage({ topic, message }, process.env.PROCESS_STATE_BROKER);

    const { topicSent, messageSentBuffer } = await new Promise(resolve => {
      client.on("message", (topicSent, messageSentBuffer) => {
        resolve({topicSent, messageSentBuffer});
      });
    });

    const messageSent = Buffer.from(messageSentBuffer).toString("utf-8");
    expect(topic).toEqual(topicSent);
    expect(message).toMatchObject(JSON.parse(messageSent));
  });
});

describe.skip("RabbitMQ Broker Tests", () => {
  beforeAll(async () => {
    process.env.MQTT = "false";
    process.env.AMQP = "true";
    process.env.ACTIVITY_MANAGER_BROKER = "AMQP";
    process.env.PROCESS_STATE_BROKER = "AMQP";
  });

  test("should handle AM messages with AMQP", async () => {
    const topic = "am_test_amqp";
    const message = {
      process_id: "c60008b7-3715-4395-b2d2-bb31083fd9b8",
      id: "404bbbd7-da3d-4c7c-bc02-3375b991bc85",
      status: "started",
      props: {},
    };
    const activityManager = {
      _id: "404bbbd7-da3d-4c7c-bc02-3375b991bc85",
      _process_id: "c60008b7-3715-4395-b2d2-bb31083fd9b8",
      _props: {
        _result: {},
        action: "TEST"
      },
      _parameters: {}
    };
    const activityManagerParsed = {
      input: {
        activityManagerId: "404bbbd7-da3d-4c7c-bc02-3375b991bc85",
        processId: "c60008b7-3715-4395-b2d2-bb31083fd9b8",
      },
      action: "TEST",
      schema: {}
    };
    

    await broker.connect();
    const channel = getChannel();
    await broker.publishMessage({ topic, message, context: activityManager }, process.env.ACTIVITY_MANAGER_BROKER);

    const messageSent = await new Promise(resolve => {
      channel.consume(process.env.BROKER_QUEUE, (messageSent) => {
        channel.close();
        resolve(messageSent.content.toString());
      });
    });

    expect(activityManagerParsed).toMatchObject(JSON.parse(messageSent));
  });
});
