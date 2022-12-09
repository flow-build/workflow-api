require("dotenv").config();
const DeepCompareNode = require("../nodes/deepCompareNode");

beforeAll(async () => {});

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
    expect(Object.keys(cleanData[0]).length).toBe(2)
    expect(cleanData[0].id).toBeDefined()
    expect(cleanData[0].secondField).toBeDefined()
  });
});

describe("schema validation", () => {
  test("should accept a correct node schema", async () => {
    const correctNode = {
      id: "1",
      name: "rightSchema",
      next: "2",
      lane_id: "any",
      type: "systemTask",
      category: "deepCompare",
      parameters: {
        input: {
          base: [{ id: 1}],
          candidate: [{id: 1}],
          commonKeys: ["id"],
          ignoreKeys: ["secondField"]
        }
      }
    }

    const node = new DeepCompareNode(correctNode)
    const [validation, errors] = node.validate()
    expect(validation).toBeTruthy()
    expect(errors).toBe("null")
  })

  test("should accept $ref", async () => {
    const correctNode = {
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
          ignoreKeys: { $ref: "bag.ignoreKeys" }
        }
      }
    }

    const node = new DeepCompareNode(correctNode)
    const [validation, errors] = node.validate()
    expect(validation).toBeTruthy()
    expect(errors).toBe("null")
  })

  test("should require base", async () => {
    const correctNode = {
      id: "1",
      name: "rightSchema",
      next: "2",
      lane_id: "any",
      type: "systemTask",
      category: "deepCompare",
      parameters: {
        input: {
          candidate: [{id: 1}],
          commonKeys: ["id"],
          ignoreKeys: ["secondField"]
        }
      }
    }

    const node = new DeepCompareNode(correctNode)
    const [validation, errors] = node.validate()
    expect(validation).toBeFalsy()
    expect(JSON.parse(errors)).toBeDefined()
  })

  test("should require candidate", async () => {
    const correctNode = {
      id: "1",
      name: "rightSchema",
      next: "2",
      lane_id: "any",
      type: "systemTask",
      category: "deepCompare",
      parameters: {
        input: {
          base: [{id: 1}],
          commonKeys: ["id"],
          ignoreKeys: ["secondField"]
        }
      }
    }

    const node = new DeepCompareNode(correctNode)
    const [validation, errors] = node.validate()
    expect(validation).toBeFalsy()
    expect(JSON.parse(errors)).toBeDefined()
  })
})