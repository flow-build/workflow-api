const { ProcessStatus, Nodes } = require("@flowbuild/engine");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { logger } = require("../utils/logger");
const { nanoid } = require("nanoid");
const uuid = require("uuid");

class CreateUuidNode extends Nodes.SystemTaskNode {
  static schema() {
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
              required: ["type"],
              properties: {
                type: { type: "string", enum: ["uuid", "nanoid"] },
                options: {
                  type: "object",
                  properties: {
                    version: { type: "string", enum: ["v1", "v4"] },
                    size: {
                      oneOf: [{ type: "integer" }, { type: "object" }],
                    },
                  },
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
    const validate = ajv.compile(CreateUuidNode.schema());
    const validation = validate(spec);
    return [validation, JSON.stringify(validate.errors)];
  }

  validate() {
    return CreateUuidNode.validate(this._spec);
  }

  async _run(executionData) {
    let result = {};

    function getVersion(uVersion) {
      if (!uVersion) {
        return uuid.v1();
      }

      const version = {
        v1: () => uuid.v1(),
        v4: () => uuid.v4(),
      };

      return version[uVersion]() || uuid.v1();
    }

    try {
      if (executionData.type === "nanoid") {
        if (executionData.options?.size) {
          result.id = nanoid(executionData.options.size);
        } else {
          result.id = nanoid();
        }
      } else {
        result.id = getVersion(executionData.options?.version);
      }
    } catch (error) {
      logger.error("NODE.ERROR", `ERROR AT NID [${this.id}] | CREATE UUID | unexpected error`, {
        node_id: this.id,
        error: error,
      });
      throw new Error(error);
    }

    return [result, ProcessStatus.RUNNING];
  }
}

module.exports = CreateUuidNode;
