const kafka = require("../services/broker/kafka");
const { ProcessStatus, Nodes } = require("@flowbuild/engine");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { logger } = require("../utils/logger");

class KafkaPublishNode extends Nodes.SystemTaskNode {
  static get schema() {
    return {
      type: "object",
      required: ["id", "name", "next", "type", "lane_id", "parameters"],
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        category: { type: "string" },
        type: { type: "string" },
        next: { type: "string" },
        parameters: {
          type: "object",
          required: ["input"],
          properties: {
            input: {
              type: "object",
              required: ["message", "event", "topic"],
              properties: {
                message: { type: "object" },
                event: { oneOf: [{ type: "object" }, { type: "string" }] },
                topic: { oneOf: [{ type: "object" }, { type: "string" }] },
              },
            },
          },
        },
        lane_id: { type: "string" },
      },
    };
  }

  static validate(spec, schema = null) {
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    const validationSchema = schema || KafkaPublishNode.schema;
    const validate = ajv.compile(validationSchema);
    const validation = validate(spec);
    return [validation, JSON.stringify(validate.errors)];
  }

  validate() {
    return KafkaPublishNode.validate(this._spec);
  }

  static validateExecutionData(spec) {
    const schema = {
      type: "object",
      required: ["message", "event", "topic"],
      properties: {
        message: { type: "object" },
        event: { type: "string" },
        topic: { type: "string" },
      },
    };
    return KafkaPublishNode.validate(spec, schema);
  }

  _preProcessing({ bag, input, actor_data, environment, parameters }) {
    const executionData = super._preProcessing({ bag, input, actor_data, environment, parameters });
    return { ...executionData, ...{ process_id: parameters.process_id } };
  }

  async _run(executionData) {
    try {
      logger.debug("KafkaPublish Node running");
      const [is_valid, validation_errors] = KafkaPublishNode.validateExecutionData(executionData);
      if (!is_valid) {
        const errors = JSON.parse(validation_errors).map((err) => `field '${err.instancePath}' ${err.message}`);
        throw JSON.stringify(errors);
      }
      const { message, event, topic } = executionData;
      const result = await kafka.publishMessage({
        topic,
        message: { ...message, ...{ processId: executionData.process_id } },
        key: event,
      });

      return [{ data: result }, ProcessStatus.RUNNING];
    } catch (err) {
      logger.error("KafkaPublish node failed", err);
      throw err;
    }
  }
}

module.exports = KafkaPublishNode;
