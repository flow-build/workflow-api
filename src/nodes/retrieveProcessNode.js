const { SystemTaskNode } = require("@flowbuild/engine/src/core/workflow/nodes");
const { Validator } = require("@flowbuild/engine/src/core/validators");
const obju = require("@flowbuild/engine/src/core/utils/object");
const { Index } = require("@flowbuild/indexer");
const { ProcessStatus } = require("@flowbuild/engine/src/core/workflow/process_state");
const { logger } = require("../utils/logger");
const { db } = require("../tests/utils/db");

class retrieveProcessesNode extends SystemTaskNode {
  static get rules() {
    const inputRules = {
      input_has_entity_id: [obju.hasField, "entity_id"],
      input_entity_id_has_valid_type: [obju.isFieldTypeIn, "entity_id", ["string"]],
    };
    return {
      ...super.rules,
      input_nested_validations: [new Validator(inputRules), "parameters.input"],
    };
  }

  validate() {
    return retrieveProcessesNode.validate(this._spec);
  }

  async _run(executionData) {
    try {
      logger.debug("[Indexer] retrieveProcesses node");
      const _idx = new Index(db);
      const result = await _idx.fetchProcessByEntity(executionData.entity_id, executionData.limit);
      return [{ data: result }, ProcessStatus.RUNNING];
    } catch (err) {
      logger.error("retrieveProcesses node failed", err);
      throw err;
    }
  }
}

module.exports = retrieveProcessesNode;
