const { ProcessStatus, Nodes} = require("@flowbuild/engine");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { logger } = require("../utils/logger");

const _ = require("lodash")

class FilterDataNode extends Nodes.SystemTaskNode {

  static get schema() {
    return {
      type: "object",
      required: [],
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
              type: "object"
            }
          ]
        },
        key: { type: "string" }
      },
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
