const { SystemTaskNode } = require("@flowbuild/engine/src/core/workflow/nodes");
const { Validator } = require("@flowbuild/engine/src/core/validators");
const { ProcessStatus } = require("@flowbuild/engine/src/core/workflow/process_state");
const { logger } = require("../utils/logger");

const { v1: uuid } = require("uuid");
const { nanoid } = require("nanoid");
const { createJWTToken } = require("../services/tokenGenerator");
const { jwtSecret } = require("../utils/jwtSecret");

class tokenizeNode extends SystemTaskNode {
  static get rules() {
    const inputRules = {};
    return {
      ...super.rules,
      input_nested_validations: [new Validator(inputRules), "parameters.input"],
    };
  }

  validate() {
    return tokenizeNode.validate(this._spec);
  }

  async _run(executionData) {
    try {
      const duration = parseInt(executionData.duration) || 3600;
      let secret = executionData.secret;

      if (!executionData.secret) {
        logger.debug("[tokenizeNode] Using default secret");
        secret = jwtSecret;
      }
      if (!executionData.session_id) {
        logger.debug("[tokenizeNode] Set a random session_id");
        executionData.session_id = nanoid();
      }
      if (!executionData.actor_id) {
        logger.debug("[tokenizeNode] Set a random actor_id");
        executionData.actor_id = uuid();
      }
      if (!executionData.claims) {
        logger.debug("[tokenizeNode] Set an empty claims list");
        executionData.claims = [];
      }
      const jwtToken = createJWTToken(executionData, secret, duration);
      const result = {
        jwtToken,
        payload: executionData,
      };
      return [{ data: result }, ProcessStatus.RUNNING];
    } catch (err) {
      logger.error("[tokenizeNode] Node failed", err);
      throw err;
    }
  }
}

module.exports = tokenizeNode;
