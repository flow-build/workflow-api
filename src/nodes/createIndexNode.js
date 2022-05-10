/* eslint-disable no-unused-vars */
const { ProcessStatus, Nodes } = require("@flowbuild/engine");
const { Validator } = require("@flowbuild/engine/src/core/validators");
const obju = require("@flowbuild/engine/src/core/utils/object");
const { Index } = require("@flowbuild/indexer");
const { prepare } = require("@flowbuild/engine/src/core/utils/input");
const { logger } = require("../utils/logger");
const { db } = require("../utils/db");

class CreateIndexNode extends Nodes.SystemTaskNode {
  static get rules() {
    const inputRules = {
      input_has_entity_type: [obju.hasField, "entity_type"],
      input_has_entity_id: [obju.hasField, "entity_id"],
    };
    return {
      ...super.rules,
      input_nested_validations: [new Validator(inputRules), "parameters.input"],
    };
  }

  validate() {
    return CreateIndexNode.validate(this._spec);
  }

  _preProcessing({ bag, input, actor_data, environment, parameters }) {
    return prepare(this._spec.parameters.input, {
      bag: bag,
      result: input,
      actor_data: actor_data,
      environment: environment,
    });
  }

  async run({ bag = {}, input = {}, actor_data = {}, environment = {}, process_id = null, parameters = {} }, lisp) {
    const hrt_run_start = process.hrtime();
    try {
      logger.debug("[Indexer] createIndex Node");
      const executionData = this._preProcessing({
        bag,
        input,
        actor_data,
        environment,
        parameters,
      });
      const indexObj = {
        entity_type: executionData.entity_type,
        entity_id: executionData.entity_id,
        process_id,
      };
      const _idx = new Index(db);
      const result = await _idx.createIndex(indexObj);

      const hrt_run_interval = process.hrtime(hrt_run_start);
      const time_elapsed = Math.ceil(hrt_run_interval[0] * 1000 + hrt_run_interval[1] / 1000000);

      return {
        node_id: this.id,
        bag: bag,
        external_input: null,
        result: result,
        error: null,
        status: ProcessStatus.RUNNING,
        next_node_id: this.next(executionData),
        time_elapsed: time_elapsed,
      };
    } catch (err) {
      logger.error("Indexer failed", err);
      return this._processError(err, { bag });
    }
  }
}

module.exports = CreateIndexNode;
