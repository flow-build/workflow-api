require("dotenv").config();
const { Nodes, ProcessStatus, utils } = require("@flowbuild/engine");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const axios = require("axios").default;
const { query, mutation } = require("gql-query-builder");

class GraphQlNode extends Nodes.SystemTaskNode {
  static get schema() {
    let mySchema = super.schema;
    mySchema.properties.parameters = {
      type: "object",
      required: ["request", "input"],
      properties: {
        request: {
          type: "object",
          required: ["baseUrl", "verb"],
          properties: {
            baseUrl: { oneOf: [{ type: "string" }, { type: "object" }] },
            route: { oneOf: [{ type: "string" }, { type: "object" }] },
            verb: { oneOf: [{ type: "string" }, { type: "object" }] },
            headers: { type: "object" },
          },
        },
        input: {
          type: "object",
          required: ["action", "operation"],
          properties: {
            action: { oneOf: [{ type: "string" }, { type: "object" }] },
            operation: { oneOf: [{ type: "string" }, { type: "object" }] },
            fields: { oneOf: [{ type: "array" }, { type: "object" }] },
            variables: { type: "object" },
          },
        },
      },
    };

    return mySchema;
  }

  static validate(spec) {
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    const validate = ajv.compile(GraphQlNode.schema);
    const validation = validate(spec);
    return [validation, JSON.stringify(validate.errors)];
  }

  validate() {
    return GraphQlNode.validate(this._spec);
  }

  async _run(execution_data) {
    console.log("executionData:", execution_data);
    const { request, input } = execution_data;

    const actions = {
      query: (input) => {
        return query({
          operation: input.operation,
          fields: input.fields,
          variables: input.variables,
        });
      },
      mutation: (input) => {
        return mutation({
          operation: input.operation,
          fields: input.fields,
          variables: input.variables,
        });
      },
    };

    const gqlData = actions[input.action](input);

    //console.log('gqlData', gqlData)

    const requestConfig = {
      method: request.verb,
      url: request.route,
      baseURL: request.baseUrl,
      data: gqlData,
      headers: request.headers,
      validateStatus: function (status) {
        return status <= 599;
      },
    };

    const result = await axios(requestConfig);
    //console.log('response:', result.data)

    return [
      { status: result.status, data: result.data.data },
      ProcessStatus.RUNNING,
    ];
  }

  _preProcessing({ bag, input, actor_data, environment, parameters }) {
    return utils.prepare(this._spec.parameters, {
      bag,
      result: input,
      actor_data,
      environment,
      parameters,
    });
  }
}

module.exports = GraphQlNode;
