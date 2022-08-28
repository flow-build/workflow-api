const { ProcessStatus, Nodes } = require("@flowbuild/engine");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { logger } = require("../utils/logger");
const { v1: uuid } = require("uuid");
const { nanoid } = require("nanoid");
const { createJWTToken } = require("../services/tokenGenerator");
const { jwtSecret } = require("../utils/jwtSecret");

class TokenizeNode extends Nodes.SystemTaskNode {
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
            input: { type: "object" },
          },
        },
      },
    };
  }

  static validate(spec) {
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    const validate = ajv.compile(TokenizeNode.schema);
    const validation = validate(spec);
    return [validation, JSON.stringify(validate.errors)];
  }

  validate() {
    return TokenizeNode.validate(this._spec);
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

module.exports = TokenizeNode;
