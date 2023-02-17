require("dotenv").config();
const RemapDataNode = require("../nodes/remapDataNode");

const nodeSchema = {
  id: "1",
  name: "rightSchema",
  next: "2",
  lane_id: "any",
  type: "systemTask",
  category: "remapData",
  parameters: {
    input: {
      data: [{ "field1": 1 }],
      dictionary: { "field": "field1" }
    },
  },
}

const executionDataExample = {
  data: [
    {
      id: 1,
      date: "01/01/2005",
      user: { name: "test" }
    }
  ],
  dictionary: {
    identification: "id",
    name: "user.name"
  }
}

beforeAll(async () => {});

describe("schema validation", () => {
  test("should accept a correct node schema", async () => {
    const myNode = new RemapDataNode(nodeSchema);
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
          data: { $ref: "bag.data" },
          dictionary: { $ref: "bag.dictionary" },
        },
      },
    };

    const myNode = new RemapDataNode(refSchema);
    const [validation, errors] = myNode.validate();
    expect(validation).toBeTruthy();
    expect(errors).toBe("null");
  });

  test("should require data", async () => {
    const schema = nodeSchema;
    delete schema.parameters.input.data;

    const node = new RemapDataNode(schema);
    const [validation, errors] = node.validate();
    expect(validation).toBeFalsy();
    expect(errors).toBeDefined();
  });

  test("should require dictionary", async () => {
    const schema = nodeSchema;
    delete schema.parameters.input.dictionary;

    const myNode = new RemapDataNode(schema);
    const [validation, errors] = myNode.validate();
    expect(validation).toBeFalsy();
    expect(errors).toBeDefined();
  });
});

describe("executionData validation", () => {
  test("should accept a correct executionData", async () => {
    const [validation, errors] = RemapDataNode.validateExecutionData(executionDataExample);
    expect(validation).toBeTruthy();
    expect(errors).toBe("null");
  });

  test("should NOT accept $ref", async () => {
    const refExecutionData = {
      data: { $ref: "bag.data" },
      dictionary: { $ref: "bag.candidate" },
    };

    const [validation, errors] = RemapDataNode.validateExecutionData(refExecutionData);
    expect(validation).toBeFalsy();
    expect(JSON.parse(errors)).toBeDefined();
  });

  test("should require data", async () => {
    const executionData = executionDataExample;
    delete executionData.data;

    const [validation, errors] = RemapDataNode.validateExecutionData(executionData);
    expect(validation).toBeFalsy();
    expect(JSON.parse(errors)).toBeDefined();
  });

  test("should require dictionary", async () => {
    const executionData = executionDataExample;
    delete executionData.dictionary;

    const [validation, errors] = RemapDataNode.validateExecutionData(executionData);
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
    category: "remapData",
    parameters: {
      input: {
        data: [
          {
            id: 1,
            date: "01/01/2005",
            user: { name: "test" }
          }
        ],
        dictionary: {
          identification: "id",
          name: "user.name"
        },
      },
    },
  };

  const nodeExampleError = {
    id: "1",
    name: "rightSchema",
    next: "2",
    lane_id: "any",
    type: "systemTask",
    category: "remapData",
    parameters: {
      input: {
        data: [
          {
            id: 1,
            date: "01/01/2005",
            user: { name: "test" }
          }
        ],
        dictionary: {
          note: "advice"
        },
      },
    },
  };

  const nodeExampleWarning = {
    id: "1",
    name: "rightSchema",
    next: "2",
    lane_id: "any",
    type: "systemTask",
    category: "remapData",
    parameters: {
      input: {
        data: [
          {
            id: 1,
            date: "01/01/2005",
            user: { name: "test" }
          }
        ],
        dictionary: {
          note: "advice",
          day: "date"
        },
      },
    },
  };

  const nodeExampleNestedObject = {
    id: "1",
    name: "rightSchema",
    next: "2",
    lane_id: "any",
    type: "systemTask",
    category: "remapData",
    parameters: {
      input: {
        data: [
          {
            id: 1,
            date: "01/01/2005",
            number: "123456",
            user: {
              profile: {
                name: "name_test"
              }
            },
            address: {
              street: "21th street",
              infos: {
                number: 12
              }
            }
          },
          {
            id: 2,
            date: "12/10/1997",
            number: "1098765",
            user: {
              profile: {
                name: "second_name"
              }
            },
            address: {
              street: "Boulevard avenue",
              infos: {
                number: 30
              }
            }
          }
        ],
        dictionary: {
          identification: "id",
          profile: {
            name: "user.profile.name",
            mobile_number: "number",
            additional_data: {
              address_street: "address.street",
              date_of_change: "date",
              residence_number: "address.infos.number"
            }
          }
        },
      },
    },
  };

  test("should work", async () => {
    const myNode = new RemapDataNode(nodeExampleSuccess);
    const nodeResult = await myNode.run({});
    expect(nodeResult.status).toBe("running");
    expect(nodeResult.result.status).toEqual("success");
    expect(nodeResult.result.messages).toHaveLength(0);
    expect(nodeResult.result.data[0].identification).toBeDefined();
    expect(nodeResult.result.data[0].identification).toEqual(1);
    expect(nodeResult.result.data[0].name).toBeDefined();
    expect(nodeResult.result.data[0].name).toEqual("test");
  });

  test("should work with nested object on dictionary", async () => {
    const myNode = new RemapDataNode(nodeExampleNestedObject);
    const nodeResult = await myNode.run({});
    expect(nodeResult.status).toBe("running");
    expect(nodeResult.result.status).toEqual("success");
    expect(nodeResult.result.messages).toHaveLength(0);
    expect(nodeResult.result.data[0].identification).toEqual(1);
    expect(nodeResult.result.data[0].profile.name).toEqual("name_test");
    expect(nodeResult.result.data[0].profile.mobile_number).toEqual("123456");
    expect(nodeResult.result.data[0].profile.additional_data.address_street).toEqual("21th street");
    expect(nodeResult.result.data[0].profile.additional_data.date_of_change).toEqual("01/01/2005");
    expect(nodeResult.result.data[0].profile.additional_data.residence_number).toEqual(12);
    expect(nodeResult.result.data[1].identification).toEqual(2);
    expect(nodeResult.result.data[1].profile.name).toEqual("second_name");
    expect(nodeResult.result.data[1].profile.mobile_number).toEqual("1098765");
    expect(nodeResult.result.data[1].profile.additional_data.address_street).toEqual("Boulevard avenue");
    expect(nodeResult.result.data[1].profile.additional_data.date_of_change).toEqual("12/10/1997");
    expect(nodeResult.result.data[1].profile.additional_data.residence_number).toEqual(30);
  });

  test("should throw error on result with invalid key on dictionary", async () => {
    const myNode = new RemapDataNode(nodeExampleError);
    const nodeResult = await myNode.run({});
    expect(nodeResult.status).toBe("running");
    expect(nodeResult.result.status).toEqual("error");
    expect(nodeResult.result.messages).toHaveLength(1);
    expect(nodeResult.result.messages[0]).toEqual("'advice' from dictionary not found in data");
    expect(nodeResult.result.data).toHaveLength(0);
  });

  test("should throw warning on result with invalid key on dictionary", async () => {
    const myNode = new RemapDataNode(nodeExampleWarning);
    const nodeResult = await myNode.run({});
    expect(nodeResult.status).toBe("running");
    expect(nodeResult.result.data[0].day).toBeDefined();
    expect(nodeResult.result.data[0].day).toEqual("01/01/2005");
    expect(nodeResult.result.status).toEqual("warning");
    expect(nodeResult.result.messages).toHaveLength(1);
    expect(nodeResult.result.messages[0]).toEqual("'advice' from dictionary not found in data");
  });
});
