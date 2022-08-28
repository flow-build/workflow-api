const { ProcessStatus, Nodes } = require("@flowbuild/engine");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { logger } = require("../utils/logger");

class ValidateSchemaNode extends Nodes.SystemTaskNode {
  static get schema() {
    return {
      type: "object",
      required: ["id", "name", "next", "type", "lane_id", "parameters"],
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
              required: ["schema", "data"],
              properties: {
                schema: { type: "object" },
                data: { type: "object" },
              },
            },
          },
        },
      },
    };
  }

  static validate(spec) {
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    const validate = ajv.compile(ValidateSchemaNode.schema);
    const validation = validate(spec);
    return [validation, JSON.stringify(validate.errors)];
  }

  validate() {
    return ValidateSchemaNode.validate(this._spec);
  }

  async _run(executionData) {
    try {
      const ajv = new Ajv({ allErrors: true });
      addFormats(ajv);
      const validate = ajv.compile(executionData.schema);
      const validation = validate(executionData.data);
      return [
        {
          data: {
            is_valid: validation,
            errors: validate.errors,
          },
        },
        ProcessStatus.RUNNING,
      ];
    } catch (err) {
      logger.error("[validateSchemaNode] Node failed", err);
      throw err;
    }
  }
}

module.exports = ValidateSchemaNode;
