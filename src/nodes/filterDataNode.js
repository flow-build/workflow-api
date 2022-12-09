const { ProcessStatus, Nodes } = require("@flowbuild/engine");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { logger } = require("../utils/logger");

class FilterDataNode extends Nodes.SystemTaskNode {

  static get schema() {
    return {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        next: { type: "string" },
        type: { type: "string" },
        category: { type: "string" },
        lane_id: { type: "string" },
        parameters: {
          type: "object",
          required: ["input"],
          properties: {
            input: {
              type: "object",
              required: ["data", "primary_keys"],
              properties: {
                data: {
                  oneOf: [
                    {
                      type: "array",
                      items: { type: "object" }
                    },
                    {
                      type: "object"
                    }
                  ]
                },
                primary_keys: {
                  oneOf: [
                    {
                      type: "array",
                      items: { type: "object" }
                    },
                    {
                      type: "array",
                      items: { type: "string" }
                    },
                    {
                      type: "object"
                    }
                  ]
                }
              },
            },
          },
        },
      },
      required: ["id", "name", "next", "type", "lane_id", "parameters"],
    };
  }

  static validate(spec) {
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    const validate = ajv.compile(FilterDataNode.schema);
    const validation = validate(spec);
    return [validation, JSON.stringify(validate.errors)];
  }

  validate() {
    return FilterDataNode.validate(this._spec);
  }

  static validateExecutionData(spec) {
    const schema = {
      type: "object",
      required: ["data", "primary_keys"],
      properties: {
        data: { type: "array", items: { type: "object" } },
        primary_keys: { type: "array", items: { type: "object" } }
      }
    }
    return FilterDataNode.validate(spec, schema);
  }

  async _run(executionData) {
    try {
      const { data, primary_keys } = executionData;
      const keys = Object.keys(primary_keys);
      let result = { unsorted: [] };
      keys.forEach((key) => {
        result[key] = [];
      });

      data.forEach((item) => {
        let sorted = false;
        keys.forEach((key) => {
          let values = Object.values(primary_keys[key])[0];
          let itemValue = item[Object.keys(primary_keys[key])[0]];
          if (values.includes(itemValue)) {
            result[key].push(item);
            sorted = true;
          }
        });
        if (!sorted) {
          result["unsorted"].push(item);
        }
      });
      return [{ data: result }, ProcessStatus.RUNNING];
    } catch (err) {
      logger.error("filterData node failed", err);
      throw err;
    }
  }
}

module.exports = FilterDataNode;