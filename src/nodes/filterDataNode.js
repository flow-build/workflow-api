const { ProcessStatus, Nodes} = require("@flowbuild/engine");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { logger } = require("../utils/logger");

const _ = require("lodash")

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
              required: ["data", "values", "key"],
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
                values: {
                  oneOf: [
                    {
                      type: "array",
                      items: { type: "string" }
                    },
                    {
                      type: "string"
                    },
                    {
                      type: "object"
                    }
                  ]
                },
                keys:{
                  oneOf: [
                    {
                      type: "string"
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

  async _run(executionData) {
    try {
      const { key, data, values } = executionData;
      const result = []
      data.forEach(function (item){
        if (_.get(item, key) === values[0]) {
          result.push(item);
          values.shift();
        }
      })
      return [{ data: result }, ProcessStatus.RUNNING];
    } catch (err) {
      logger.error("filterData node failed", err);
      throw err;
    }
  }
}

module.exports = FilterDataNode;