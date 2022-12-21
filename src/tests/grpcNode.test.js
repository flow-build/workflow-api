require("dotenv").config();
const _ = require("lodash");
const GrpcNode = require("../nodes/grpcNode");

const nodeSchema = {
  id: "1",
  name: "rightSchema",
  next: "2",
  lane_id: "any",
  type: "systemTask",
  category: "grpc",
  parameters: {
    input: {
      server: "grpc.postman-echo.com",
      service: "HelloService",
      method: "SayHello",
      payload: {
        greeting: "hello there",
      },
      useReflection: true
    },
  },
};

const descriptorExample = {
  "file": [
    {
      "name": "test/rpc.proto",
      "messageType": [
        {
          "name": "HelloRequest",
          "field": [
            {
              "name": "greeting",
              "number": 1,
              "label": "LABEL_OPTIONAL",
              "type": "TYPE_STRING",
              "jsonName": "greeting"
            }
          ]
        },
        {
          "name": "HelloResponse",
          "field": [
            {
              "name": "reply",
              "number": 1,
              "label": "LABEL_OPTIONAL",
              "type": "TYPE_STRING",
              "jsonName": "reply"
            }
          ]
        }
      ],
      "service": [
        {
          "name": "HelloService",
          "method": [
            {
              "name": "SayHello",
              "inputType": ".HelloRequest",
              "outputType": ".HelloResponse"
            }
          ]
        }
      ],
      "syntax": "proto3"
    }
  ]
}

const executionDataExample = {
  server: "grpc.postman-echo.com",
  service: "HelloService",
  method: "SayHello",
  payload: {
    greeting: "hello there",
  },
};

beforeAll(async () => {});

describe("schema validation", () => {
  test("should accept a correct node schema", async () => {
    const myNode = new GrpcNode(nodeSchema);
    const [validation, errors] = myNode.validate();
    expect(validation).toBeTruthy();
    expect(errors).toBe("null");
  });

  test("should accept $ref", async () => {
    let refSchema = _.cloneDeep(nodeSchema);
    refSchema.parameters.input.method = { $ref: "bag.method" };

    const myNode = new GrpcNode(refSchema);
    const [validation, errors] = myNode.validate();
    expect(validation).toBeTruthy();
    expect(errors).toBe("null");
  });

  test("should require service", async () => {
    const schema = _.cloneDeep(nodeSchema);
    delete schema.parameters.input.service;

    const node = new GrpcNode(schema);
    const [validation, errors] = node.validate();
    expect(validation).toBeFalsy();
    expect(JSON.parse(errors)).toBeDefined();
  });

  test("should require method", async () => {
    const schema = _.cloneDeep(nodeSchema);
    delete schema.parameters.input.method;

    const myNode = new GrpcNode(schema);
    const [validation, errors] = myNode.validate();
    expect(validation).toBeFalsy();
    expect(JSON.parse(errors)).toBeDefined();
  });
});

describe("executionData validation", () => {
  test("should accept a correct executionData", async () => {
    const [validation, errors] = GrpcNode.validateExecutionData(executionDataExample);
    expect(validation).toBeTruthy();
    expect(errors).toBe("null");
  });

  test("should NOT accept $ref", async () => {
    let refExecutionData = _.cloneDeep(executionDataExample);
    refExecutionData.server = { $ref: "bag.base" };

    const [validation, errors] = GrpcNode.validateExecutionData(refExecutionData);
    expect(validation).toBeFalsy();
    expect(JSON.parse(errors)).toBeDefined();
  });

  test("should require method", async () => {
    let executionData = _.cloneDeep(executionDataExample);
    delete executionData.method;

    const [validation, errors] = GrpcNode.validateExecutionData(executionData);
    expect(validation).toBeFalsy();
    expect(JSON.parse(errors)).toBeDefined();
  });

  test("should require service", async () => {
    let executionData = _.cloneDeep(executionDataExample);
    delete executionData.service;

    const [validation, errors] = GrpcNode.validateExecutionData(executionData);
    expect(validation).toBeFalsy();
    expect(JSON.parse(errors)).toBeDefined();
  });
});

describe("run node - Reflection Mode", () => {
  test("should work", async () => {
    const myNode = new GrpcNode(nodeSchema);
    const nodeResult = await myNode.run({});
    console.log(nodeResult);
    expect(nodeResult.status).toBe("running");
    expect(nodeResult.result.data).toBeDefined();
    expect(nodeResult.result.data.reply).toBeDefined();
  });

  test("should fail if server is not existant", async () => {
    let schema = _.cloneDeep(nodeSchema);
    schema.parameters.input.server = "www.fdte.io"
    const myNode = new GrpcNode(schema);
    const nodeResult = await myNode.run({});
    console.log(nodeResult);
    expect(nodeResult.status).toBe("error");
    expect(nodeResult.error).toBeDefined();
  });

  test("should fail if service is not existant", async () => {
    let schema = _.cloneDeep(nodeSchema);
    schema.parameters.input.service = "notAService"
    const myNode = new GrpcNode(schema);
    const nodeResult = await myNode.run({});
    console.log(nodeResult);
    expect(nodeResult.status).toBe("error");
    expect(nodeResult.error).toBeDefined();
  });

  test("should fail if method is not existant", async () => {
    let schema = _.cloneDeep(nodeSchema);
    schema.parameters.input.method = "notAMethod"
    const myNode = new GrpcNode(schema);
    const nodeResult = await myNode.run({});
    console.log(nodeResult);
    expect(nodeResult.status).toBe("error");
    expect(nodeResult.error).toBeDefined();
  });
});

describe("run node - Descriptor Mode", () => {
  let nodeDescriptorSchema = _.cloneDeep(nodeSchema);
  nodeDescriptorSchema.parameters.input.useReflection = false
  nodeDescriptorSchema.parameters.input.descriptor = descriptorExample

  test("should work", async () => {
    const myNode = new GrpcNode(nodeDescriptorSchema);
    const nodeResult = await myNode.run({});
    console.log(nodeResult);
    expect(nodeResult.status).toBe("running");
    expect(nodeResult.result.data).toBeDefined();
    expect(nodeResult.result.data.reply).toBeDefined();
  });

  test("should fail if server is not existant", async () => {
    let schema = _.cloneDeep(nodeDescriptorSchema);
    schema.parameters.input.server = "www.fdte.io"
    const myNode = new GrpcNode(schema);
    const nodeResult = await myNode.run({});
    console.log(nodeResult);
    expect(nodeResult.status).toBe("error");
    expect(nodeResult.error).toBeDefined();
  });

  test("should fail if service is not existant", async () => {
    let schema = _.cloneDeep(nodeDescriptorSchema);
    schema.parameters.input.service = "notAService"
    const myNode = new GrpcNode(schema);
    const nodeResult = await myNode.run({});
    console.log(nodeResult);
    expect(nodeResult.status).toBe("error");
    expect(nodeResult.error).toBeDefined();
  });

  test("should fail if method is not existant", async () => {
    let schema = _.cloneDeep(nodeDescriptorSchema);
    schema.parameters.input.method = "notAMethod"
    const myNode = new GrpcNode(schema);
    const nodeResult = await myNode.run({});
    console.log(nodeResult);
    expect(nodeResult.status).toBe("error");
    expect(nodeResult.error).toBeDefined();
  });
});