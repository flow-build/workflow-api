const { ProcessStatus, Nodes } = require("@flowbuild/engine");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { logger } = require("../utils/logger");
const _ = require('lodash');

class RemapDataNode extends Nodes.SystemTaskNode {
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
              required: ["data", "dictionary"],
              properties: {
                data: { type: [ "object", "array" ] },
                dictionary: { type: "object" },
              },
            },
          },
        },
      },
      required: ["id", "name", "next", "type", "lane_id", "parameters"]
    };
  }

  static validate(spec) {
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    const validate = ajv.compile(RemapDataNode.schema);
    const validation = validate(spec);
    return [validation, JSON.stringify(validate.errors)];
  }

  validate() {
    return RemapDataNode.validate(this._spec);
  }

  async _run(executionData) {
    try {
      logger.debug("remapData Node running");
      const { data, dictionary  } = executionData;
      let status = 'success';
      let messages = [];

      let remapped_data = data.map((item) => {
        const remapped_item = {};
        for (const [key, value] of Object.entries(dictionary)) {
          if (typeof value === 'string' && value.length > 0 && value.includes('.')) {
            const object_value = _.get(item, value);
            if (object_value !== undefined) {
              remapped_item[key] = object_value;
            }
          } else if (value !== null && value.length > 0 && item[value] !== undefined) {
            remapped_item[key] = item[value];
          } else if (value === null || value.length === 0) {
            remapped_item[key] = value;
          }

          if (remapped_item[key] === undefined) {
            messages.push(`'${value}' from dictionary not found in data`);
          }
        }
        return remapped_item;
      });

      if (messages.length > 0) {
        if (Object.keys(remapped_data[0]).length > 0) {
          status = 'warning';
        } else {
          status = 'error';
          remapped_data = [];
        }
      }

      return [
        {
          status,
          messages,
          data: remapped_data
        },
        ProcessStatus.RUNNING,
      ];
    } catch (err) {
      logger.error("remapData Node failed", err);
      throw new Error(err);
    }
  }
}

module.exports = RemapDataNode;
