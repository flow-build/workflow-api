import { Nodes, ProcessStatus, utils } from "@flowbuild/engine"
import Ajv from "ajv"
import addFormats from "ajv-formats"
import axios, { AxiosBasicCredentials, AxiosResponse } from "axios"
import { merge } from "lodash"

interface Auth {
  username: string | object
  password: string | object
}

interface RequestParams {
  verb: string
  baseUrl: string | object
  route: string | object
  auth: Auth
  headers?: Record<string, any>
}

interface BasicAuthNodeSpec {
  next?: string
  parameters: {
    request: RequestParams
  }
}

function toAxiosBasicCredentials(auth: Auth): AxiosBasicCredentials {
  return {
    username: typeof auth.username === "string" ? auth.username : JSON.stringify(auth.username),
    password: typeof auth.password === "string" ? auth.password : JSON.stringify(auth.password)
  }
}

export default class BasicAuthNode extends (Nodes.SystemTaskNode as any) {
  request!: RequestParams
  _spec!: BasicAuthNodeSpec

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
              required: ["verb", "baseUrl", "route", "auth"],
              properties: {
                verb: { type: "string" },
                baseUrl: {
                  oneOf: [{ type: "string" }, { type: "object" }]
                },
                route: {
                  oneOf: [{ type: "string" }, { type: "object" }]
                },
                auth: {
                  type: "object",
                  required: ["username", "password"],
                  properties: {
                    username: {
                      oneOf: [{ type: "string" }, { type: "object" }]
                    },
                    password: {
                      oneOf: [{ type: "string" }, { type: "object" }]
                    }
                  }
                },
                headers: { type: "object" }
              }
            }
          }
        }
      }
    })
  }

  static validate(spec: BasicAuthNodeSpec): [boolean, string] {
    const ajv = new Ajv({ allErrors: true })
    addFormats(ajv)
    const validate = ajv.compile(BasicAuthNode.schema)
    const validation = validate(spec)
    return [validation as boolean, JSON.stringify(validate.errors)]
  }

  validate(): [boolean, string] {
    return BasicAuthNode.validate(this._spec)
  }

  async _run(executionData: any): Promise<any> {
    const { verb, baseUrl, route, auth, headers } = this.request
    const axiosAuth = toAxiosBasicCredentials(auth)
    const result: AxiosResponse = await axios({
      method: verb,
      url: route as string,
      baseURL: baseUrl as string,
      auth: axiosAuth,
      headers,
      data: executionData,
      maxContentLength: Number(process.env.MAX_CONTENT_LENGTH) || 20000,
      maxBodyLength: Number(process.env.MAX_BODY_LENGTH) || 20000,
      timeout: Number(process.env.TIMEOUT) || 30000
    })
    return [{ status: result.status, data: result.data }, ProcessStatus.RUNNING]
  }

  _preProcessing({ bag, input, actor_data, environment, parameters }: any): any {
    this.request = utils.prepare(this._spec.parameters.request, { bag, result: input, actor_data, environment, parameters })
    return super._preProcessing({ bag, input, actor_data, environment, parameters })
  }
}
