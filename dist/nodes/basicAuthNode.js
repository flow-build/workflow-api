"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const engine_1 = require("@flowbuild/engine");
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const axios_1 = __importDefault(require("axios"));
const lodash_1 = require("lodash");
function toAxiosBasicCredentials(auth) {
    return {
        username: typeof auth.username === "string" ? auth.username : JSON.stringify(auth.username),
        password: typeof auth.password === "string" ? auth.password : JSON.stringify(auth.password)
    };
}
class BasicAuthNode extends engine_1.Nodes.SystemTaskNode {
    static get schema() {
        return (0, lodash_1.merge)(super.schema, {
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
        });
    }
    static validate(spec) {
        const ajv = new ajv_1.default({ allErrors: true });
        (0, ajv_formats_1.default)(ajv);
        const validate = ajv.compile(BasicAuthNode.schema);
        const validation = validate(spec);
        return [validation, JSON.stringify(validate.errors)];
    }
    validate() {
        return BasicAuthNode.validate(this._spec);
    }
    _run(executionData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { verb, baseUrl, route, auth, headers } = this.request;
            const axiosAuth = toAxiosBasicCredentials(auth);
            const result = yield (0, axios_1.default)({
                method: verb,
                url: route,
                baseURL: baseUrl,
                auth: axiosAuth,
                headers,
                data: executionData,
                maxContentLength: Number(process.env.MAX_CONTENT_LENGTH) || 20000,
                maxBodyLength: Number(process.env.MAX_BODY_LENGTH) || 20000,
                timeout: Number(process.env.TIMEOUT) || 30000
            });
            return [{ status: result.status, data: result.data }, engine_1.ProcessStatus.RUNNING];
        });
    }
    _preProcessing({ bag, input, actor_data, environment, parameters }) {
        this.request = engine_1.utils.prepare(this._spec.parameters.request, { bag, result: input, actor_data, environment, parameters });
        return super._preProcessing({ bag, input, actor_data, environment, parameters });
    }
}
exports.default = BasicAuthNode;
