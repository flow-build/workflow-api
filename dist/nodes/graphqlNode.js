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
const gql_query_builder_1 = require("gql-query-builder");
class GraphQlNode extends engine_1.Nodes.SystemTaskNode {
    static get schema() {
        const mySchema = super.schema;
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
        };
        return mySchema;
    }
    static validate(spec) {
        const ajv = new ajv_1.default({ allErrors: true });
        (0, ajv_formats_1.default)(ajv);
        const validate = ajv.compile(GraphQlNode.schema);
        const validation = validate(spec);
        return [validation, JSON.stringify(validate.errors)];
    }
    validate() {
        return GraphQlNode.validate(this._spec);
    }
    _run(executionData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { request, input } = executionData;
            const actions = {
                query: (input) => {
                    return (0, gql_query_builder_1.query)({
                        operation: input.operation,
                        fields: input.fields,
                        variables: input.variables
                    });
                },
                mutation: (input) => {
                    return (0, gql_query_builder_1.mutation)({
                        operation: input.operation,
                        fields: input.fields,
                        variables: input.variables
                    });
                }
            };
            const gqlData = actions[input.action](input);
            const requestConfig = {
                method: request.verb,
                url: request.route,
                baseURL: request.baseUrl,
                data: gqlData,
                headers: request.headers,
                validateStatus: function (status) {
                    return status <= 599;
                }
            };
            const result = yield (0, axios_1.default)(requestConfig);
            return [
                { status: result.status, data: result.data },
                engine_1.ProcessStatus.RUNNING
            ];
        });
    }
    _preProcessing({ bag, input, actor_data, environment, parameters }) {
        return engine_1.utils.prepare(this._spec.parameters, {
            bag,
            result: input,
            actor_data,
            environment,
            parameters
        });
    }
}
exports.default = GraphQlNode;
