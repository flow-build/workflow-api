
const { ProcessStatus, Nodes } = require("@flowbuild/engine");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { Index } = require("@flowbuild/indexer");
const { logger } = require("../utils/logger");
const { db } = require("../tests/utils/db");

class RetrieveProcessesNode extends Nodes.SystemTaskNode {

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
          properties: {
            input: {
              type: "object",
              required: ["entity_id"],
              properties: {
                entity_id: {
                  oneOf: [
                    { type: "string", format: "uuid" },
                    { 
                      type: "object", 
                      properties: {
                        "$ref": { type: "string" },
                      }
                    }
                  ]
                },
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
    const validate = ajv.compile(RetrieveProcessesNode.schema);
    const validation = validate(spec);
    return [validation, JSON.stringify(validate.errors)];
  }

  validate() {
    return RetrieveProcessesNode.validate(this._spec);
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

module.exports = RetrieveProcessesNode;
