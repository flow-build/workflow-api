
const { ProcessStatus, Nodes } = require("@flowbuild/engine");
const Ajv = require("ajv");


class FilterData extends Nodes.SystemTaskNode {

  static get schema() {
    return {
      type: "object",
      required: ["data", "keys"],
      properties: {
        data: { type: "array" },
        values: { type: "array" },
        keys: { type: "string" }
      },
    };
  }

  static validate(spec) {
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    const validate = ajv.compile(FilterData.schema);
    const validation = validate(spec);
    return [validation, JSON.stringify(validate.errors)];
  }

  validate() {
    return FilterData.validate(this._spec);
  }

  async _run(executionData) {
    try {
      const keys = executionData.keys;
      const values = executionData.values;
      const data = executionData.data;
      const result = data.filter((item) => item.data.cod_vend === keys.cod_vend);
      return [{ data: result }, ProcessStatus.RUNNING];
    } catch (err) {
      logger.error("filterData node failed", err);
      throw err;
    }
  }
}

module.exports = FilterData;
