const { ProcessStatus, Nodes } = require("@flowbuild/engine");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { logger } = require("../utils/logger");

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
              required: ["origin_array", "remap_schema"],
              properties: {
                origin_array: { type: [ "object", "array" ] },
                remap_schema: { type: "object" },
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
      const { origin_array, remap_schema  } = executionData;
      const remaped_array = origin_array.map((item) => {
        const remaped_item = {};
        for (const [key, value] of Object.entries(remap_schema)) {
          if (!!value && value.length > 0) {
            remaped_item[key] = item[value];
          } else {
            remaped_item[key] = item[key];
          }
        }
        return {
          ...remaped_item
        }
      });

      return [
        {
          remaped_array
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
