require("dotenv").config();
const _ = require("lodash");
const DeepCompareNode = require("../nodes/deepCompareNode");

const nodeSchema = {
  id: "1",
  name: "rightSchema",
  next: "2",
  lane_id: "any",
  type: "systemTask",
  category: "deepCompare",
  parameters: {
    input: {
      base: [{ id: 1 }],
      candidate: [{ id: 1 }],
      commonKeys: ["id"],
      ignoreKeys: ["secondField"],
    },
  },
};

const executionDataExample = {
  base: [
    { id: 1, firstField: "a" },
    { id: 2, firstField: "b" },
  ],
  candidate: [
    { id: 2, firstField: "c" },
    { id: 3, firstField: "d" },
  ],
  commonKeys: ["id"],
  ignoreKeys: ["firstField"],
};

beforeAll(async () => {});

describe("schema validation", () => {
  test("should accept a correct node schema", async () => {
    const myNode = new DeepCompareNode(nodeSchema);
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
      category: "deepCompare",
      parameters: {
        input: {
          base: { $ref: "bag.base" },
          candidate: { $ref: "bag.candidate" },
          commonKeys: { $ref: "bag.commonKeys" },
          ignoreKeys: { $ref: "bag.ignoreKeys" },
        },
      },
    };

    const myNode = new DeepCompareNode(refSchema);
    const [validation, errors] = myNode.validate();
    expect(validation).toBeTruthy();
    expect(errors).toBe("null");
  });

  test("should require base", async () => {
    const schema = nodeSchema;
    delete schema.parameters.input.base;

    const node = new DeepCompareNode(schema);
    const [validation, errors] = node.validate();
    expect(validation).toBeFalsy();
    expect(JSON.parse(errors)).toBeDefined();
  });

  test("should require candidate", async () => {
    const schema = nodeSchema;
    delete schema.parameters.input.candidate;

    const myNode = new DeepCompareNode(schema);
    const [validation, errors] = myNode.validate();
    expect(validation).toBeFalsy();
    expect(JSON.parse(errors)).toBeDefined();
  });
});

describe("executionData validation", () => {
  test("should accept a correct executionData", async () => {
    const [validation, errors] = DeepCompareNode.validateExecutionData(executionDataExample);
    expect(validation).toBeTruthy();
    expect(errors).toBe("null");
  });

  test("should NOT accept $ref", async () => {
    const refExecutionData = {
      base: { $ref: "bag.base" },
      candidate: { $ref: "bag.candidate" },
      commonKeys: { $ref: "bag.commonKeys" },
      ignoreKeys: { $ref: "bag.ignoreKeys" },
    };

    const [validation, errors] = DeepCompareNode.validateExecutionData(refExecutionData);
    expect(validation).toBeFalsy();
    expect(JSON.parse(errors)).toBeDefined();
  });

  test("should require base", async () => {
    const executionData = executionDataExample;
    delete executionData.base;

    const [validation, errors] = DeepCompareNode.validateExecutionData(executionData);
    expect(validation).toBeFalsy();
    expect(JSON.parse(errors)).toBeDefined();
  });

  test("should require candidate", async () => {
    const executionData = executionDataExample;
    delete executionData.candidate;

    const [validation, errors] = DeepCompareNode.validateExecutionData(executionData);
    expect(validation).toBeFalsy();
    expect(JSON.parse(errors)).toBeDefined();
  });
});

describe("clean", () => {
  test("should ignore should work", async () => {
    const data = [
      { id: 1, firstField: "a", secondField: "d" },
      { id: 2, firstField: "b", secondField: "e" },
      { id: 3, firstField: "c", secondField: "f" },
    ];

    const cleanData = DeepCompareNode.clean(data, ["id"], ["secondField"]);
    expect(cleanData[0].secondField).toBeUndefined();
  });

  test("should remove duplicates should work", async () => {
    const data = [
      { id: 1, firstField: "a", secondField: "d" },
      { id: 1, firstField: "a", secondField: "e" },
      { id: 2, firstField: "c", secondField: "f" },
    ];

    const cleanData = DeepCompareNode.clean(data, ["id"], ["secondField"]);
    expect(cleanData.length).toEqual(2);
  });

  test("should return error if there is a duplicate", async () => {
    const data = [
      { id: 1, firstField: "a", secondField: "d" },
      { id: 1, firstField: "b", secondField: "e" },
      { id: 2, firstField: "c", secondField: "f" },
    ];

    const cleanData = DeepCompareNode.clean(data, ["id"], ["secondField"]);
    expect(cleanData.duplicates).toBeTruthy();
  });

  test("should work without ignore", async () => {
    const data = [
      { id: 1, firstField: "a", secondField: "d" },
      { id: 1, firstField: "b", secondField: "e" },
      { id: 2, firstField: "c", secondField: "f" },
    ];

    const cleanData = DeepCompareNode.clean(data, ["id"]);
    expect(cleanData.duplicates).toBeTruthy();
  });

  test("should accept multiple keys", async () => {
    const data = [
      { id: 1, firstField: "a", secondField: "d" },
      { id: 1, firstField: "b", secondField: "e" },
      { id: 2, firstField: "c", secondField: "f" },
    ];

    const cleanData = DeepCompareNode.clean(data, ["id", "firstField"]);
    expect(cleanData.duplicates).toBeFalsy();
    expect(cleanData.length).toBe(3);
  });

  test("should accept multiple ignoreKeys", async () => {
    const data = [
      { id: 1, firstField: "a", secondField: "d", thirdField: "g" },
      { id: 2, firstField: "b", secondField: "e", thirdField: "h" },
      { id: 3, firstField: "c", secondField: "f", thirdField: "i" },
    ];

    const cleanData = DeepCompareNode.clean(data, ["id"], ["firstField", "thirdField"]);
    expect(cleanData.duplicates).toBeFalsy();
    expect(cleanData.length).toBe(3);
    expect(Object.keys(cleanData[0]).length).toBe(2);
    expect(cleanData[0].id).toBeDefined();
    expect(cleanData[0].secondField).toBeDefined();
  });
});

describe("run node", () => {
  const nodeExample = {
    id: "1",
    name: "rightSchema",
    next: "2",
    lane_id: "any",
    type: "systemTask",
    category: "deepCompare",
    parameters: {
      input: {
        base: [
          { id: 1, firstField: "a", secondField: "b" }, //only at base
          { id: 2, firstField: "c", secondField: "d" },
          { id: 3, firstField: "e", secondField: "f" },
        ],
        candidate: [
          { id: 2, firstField: "c", secondField: "d" }, //unchanged
          { id: 3, firstField: "i", secondField: "j" }, //changed
          { id: 4, firstField: "g", secondField: "h" }, //only at candidate
        ],
        commonKeys: ["id"],
        ignoreKeys: ["secondField"],
      },
    },
  };

  test("should work", async () => {
    const myNode = new DeepCompareNode(nodeExample);
    const nodeResult = await myNode.run({});
    expect(nodeResult.status).toBe("running");
    expect(nodeResult.result.data.onlyAtCandidate).toBeDefined();
    expect(nodeResult.result.data.onlyAtCandidate.length).toBe(1);
    expect(nodeResult.result.data.onlyAtBase).toBeDefined();
    expect(nodeResult.result.data.onlyAtBase.length).toBe(1);
    expect(nodeResult.result.data.unchanged).toBeDefined();
    expect(nodeResult.result.data.unchanged.length).toBe(1);
    expect(nodeResult.result.data.changed).toBeDefined();
    expect(nodeResult.result.data.changed.length).toBe(1);
  });

  test("should work with multiple commonKeys", async () => {
    let nodeSpec = _.cloneDeep(nodeExample);
    nodeSpec.parameters.input.commonKeys = ["id", "firstField"]
    const myNode = new DeepCompareNode(nodeSpec);
    const nodeResult = await myNode.run({});
    expect(nodeResult.status).toBe("running");
    expect(nodeResult.result.data.onlyAtCandidate).toBeDefined();
    expect(nodeResult.result.data.onlyAtCandidate.length).toBe(2);
    expect(nodeResult.result.data.onlyAtBase).toBeDefined();
    expect(nodeResult.result.data.onlyAtBase.length).toBe(2);
    expect(nodeResult.result.data.unchanged).toBeDefined();
    expect(nodeResult.result.data.unchanged.length).toBe(1);
    expect(nodeResult.result.data.changed).toBeDefined();
    expect(nodeResult.result.data.changed.length).toBe(0);
  });

  test("should fail if base has duplicated keys", async () => {
    const nodeSpec = _.cloneDeep(nodeExample);
    nodeSpec.parameters.input.base.push({ id: 1, firstField: "x", secondField: "y" })
    const myNode = new DeepCompareNode(nodeSpec);
    const nodeResult = await myNode.run({});
    expect(nodeResult.result.status).toBe("error");
    expect(nodeResult.result.message).toBe("conflict at base");
  });

  test("a fully duplicated entry should be cleaned up", async () => {
    //Ignore Keys should not be considered
    const nodeSpec = _.cloneDeep(nodeExample);
    nodeSpec.parameters.input.base.push({ id: 1, firstField: "a", secondField: "y" })
    const myNode = new DeepCompareNode(nodeSpec);
    const nodeResult = await myNode.run({});
    expect(nodeResult.status).toBe("running");
    expect(nodeResult.result.data.onlyAtCandidate).toBeDefined();
  });

  test("should fail if candidate has duplicated keys", async () => {
    const myNodeSpec = _.cloneDeep(nodeExample);
    myNodeSpec.parameters.input.candidate.push({ id: 2, firstField: "x", secondField: "y" })
    const myNode = new DeepCompareNode(myNodeSpec);
    const nodeResult = await myNode.run({});
    expect(nodeResult.result.status).toBe("error");
    expect(nodeResult.result.message).toBe("conflict at candidate");
  });

  test("should fail if executionData is invalid", async () => {
    let myNodeSpec = _.cloneDeep(nodeExample);
    myNodeSpec.parameters.input.candidate = { $ref: "bag.candidate" }
    const myNode = new DeepCompareNode(myNodeSpec);
    const nodeResult = await myNode.run({ bag: { candidate: "any" }});
    expect(nodeResult.result.status).toBe("error");
    expect(nodeResult.result.message).toBeDefined();
  });

  test("Can run without ignoreKeys", async () => {
    const nodeSpec = _.cloneDeep(nodeExample);
    delete nodeSpec.parameters.input.ignoreKeys
    const myNode = new DeepCompareNode(nodeSpec);
    const nodeResult = await myNode.run({});
    expect(nodeResult.status).toBe("running");
    expect(nodeResult.result.data.onlyAtCandidate).toBeDefined();
  });

  test("Cannot run without commonKeys", async () => {
    let nodeSpec = _.cloneDeep(nodeExample);
    nodeSpec.parameters.input.commonKeys = []
    const myNode = new DeepCompareNode(nodeSpec);
    const nodeResult = await myNode.run({});
    expect(nodeResult.status).toBe("running");
    expect(nodeResult.result.status).toBe("error");
  });

  test("Cannot run with commonKeys unresolved", async () => {
    let nodeSpec = _.cloneDeep(nodeExample);
    nodeSpec.parameters.input.commonKeys = ["any"]
    const myNode = new DeepCompareNode(nodeSpec);
    const nodeResult = await myNode.run({});
    expect(nodeResult.status).toBe("running");
    expect(nodeResult.result.status).toBe("error");
    expect(nodeResult.result.message).toBe("conflict at base");
  });
});
