import { Nodes, ProcessStatus, utils } from "@flowbuild/engine"
import Ajv from "ajv"
import addFormats from "ajv-formats"
import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import { mutation, query } from "gql-query-builder"

interface GraphQlRequest {
  baseUrl: string | object
  route: string | object
  verb: string | object
  headers?: Record<string, any>
}

interface GraphQlInput {
  action: string | object
  operation: string | object
  fields?: any[] | object
  variables?: Record<string, any>
}

interface GraphQlNodeSpec {
  parameters: {
    request: GraphQlRequest
    input: GraphQlInput
  }
}

export default class GraphQlNode extends (Nodes.SystemTaskNode as any) {
  _spec!: GraphQlNodeSpec

  static get schema() {
    const mySchema = super.schema
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
            headers: { type: "object" }
          }
        },
        input: {
          type: "object",
          required: ["action", "operation"],
          properties: {
            action: { oneOf: [{ type: "string" }, { type: "object" }] },
            operation: { oneOf: [{ type: "string" }, { type: "object" }] },
            fields: { oneOf: [{ type: "array" }, { type: "object" }] },
            variables: { type: "object" }
          }
        }
      }
    }
    return mySchema
  }

  static validate(spec: GraphQlNodeSpec): [boolean, string] {
    const ajv = new Ajv({ allErrors: true })
    addFormats(ajv)
    const validate = ajv.compile(GraphQlNode.schema)
    const validation = validate(spec)
    return [validation as boolean, JSON.stringify(validate.errors)]
  }

  validate(): [boolean, string] {
    return GraphQlNode.validate(this._spec)
  }

  async _run(executionData: any): Promise<any> {
    const { request, input } = executionData

    const actions: Record<string, (input: any) => any> = {
      query: (input) => {
        return query({
          operation: input.operation,
          fields: input.fields,
          variables: input.variables
        })
      },
      mutation: (input) => {
        return mutation({
          operation: input.operation,
          fields: input.fields,
          variables: input.variables
        })
      }
    }

    const gqlData = actions[input.action as string](input)

    const requestConfig: AxiosRequestConfig = {
      method: request.verb as string,
      url: request.route as string,
      baseURL: request.baseUrl as string,
      data: gqlData,
      headers: request.headers,
      validateStatus: function (status) {
        return status <= 599
      }
    }

    const result: AxiosResponse = await axios(requestConfig)

    return [
      { status: result.status, data: result.data },
      ProcessStatus.RUNNING
    ]
  }

  _preProcessing({ bag, input, actor_data, environment, parameters }: any): any {
    return utils.prepare(this._spec.parameters, {
      bag,
      result: input,
      actor_data,
      environment,
      parameters
    })
  }
}
