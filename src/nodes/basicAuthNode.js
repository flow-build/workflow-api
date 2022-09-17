const { Nodes, ProcessStatus, utils } = require("@flowbuild/engine");
const { merge } = require("lodash");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const axios = require("axios").default;

class BasicAuthNode extends Nodes.SystemTaskNode {
  static get schema() {
    return merge(super.schema, {
      type: "object",
      properties: {
        next: { type: "string" },
        parameters: {
          type: "object",
          properties: {
            request: {
              type: "object",
              required: ['verb','baseUrl','route','auth'],
              properties: {
                verb: { type: "string" },
                baseUrl: {
                  oneOf: [{ type: "string" }, { type: "object" }],
                },
                route: {
                  oneOf: [{ type: "string" }, { type: "object" }],
                },
                auth: {
                  type: "object",
                  required: ['username', 'password'],
                  properties: {
                    username: {
                      oneOf: [{ type: "string" }, { type: "object" }],
                    },
                    password: {
                      oneOf: [{ type: "string" }, { type: "object" }],
                    },
                  },
                },
                headers: { type: "object" },
              },
            },
          },
        },
      },
    });
  }

  static validate(spec) {
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    const validate = ajv.compile(BasicAuthNode.schema);
    const validation = validate(spec);
    return [validation, JSON.stringify(validate.errors)];
  }

  validate() {
    return BasicAuthNode.validate(this._spec);
  }

  async _run(executionData) {
    const { verb, baseUrl, route, auth, headers } = this.request;
    console.log(this.request)
    const result = await axios({
      method: verb,
      url: route,
      baseURL: baseUrl,
      auth,
      headers,
      data: executionData,
      maxContentLength: 20000,
      maxBodyLength: 20000,
      timeout: 10000,
    });
    return [{ status: result.status, data: result.data }, ProcessStatus.RUNNING];
  }

  _preProcessing({ bag, input, actor_data, environment, parameters }) {
    this.request = utils.prepare(this._spec.parameters.request, { bag, result: input, actor_data, environment, parameters });
    return super._preProcessing({ bag, input, actor_data, environment, parameters });
  }
}

module.exports = {
  BasicAuthNode,
};
