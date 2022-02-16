const { SystemTaskNode } = require("@flowbuild/engine/src/core/workflow/nodes");
const { Validator } = require("@flowbuild/engine/src/core/validators");
const obju = require("@flowbuild/engine/src/core/utils/object");
const { ProcessStatus } = require("@flowbuild/engine/src/core/workflow/process_state");
const { logger } = require("../utils/logger");

const { validateDataWithSchema } = require("../validators/base");

class validateSchemaNode extends SystemTaskNode {
  static get rules() {
    const inputRules = {
      input_has_schema: [obju.hasField, "schema"],
      input_has_data: [obju.hasField, "data"],
    };
    return {
      ...super.rules,
      input_nested_validations: [new Validator(inputRules), "parameters.input"],
    };
  }

  validate() {
    return validateSchemaNode.validate(this._spec);
  }

  async _run(executionData) {
    try {
      const result = validateDataWithSchema(executionData.schema, executionData.data);
      return [{ data: result }, ProcessStatus.RUNNING];
    } catch (err) {
      logger.error("[validateSchemaNode] Node failed", err);
      throw err;
    }
  }
}

module.exports = validateSchemaNode;
