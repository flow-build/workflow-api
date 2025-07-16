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
const db_1 = require("../utils/db");
const logger_1 = require("../utils/logger");
const engine_1 = require("@flowbuild/engine");
const indexer_1 = require("@flowbuild/indexer");
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
class CreateIndexNode extends engine_1.Nodes.SystemTaskNode {
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
                            required: ["entity_type", "entity_id"],
                            properties: {
                                entity_type: {
                                    oneOf: [{ type: "string" }, { type: "object" }]
                                },
                                entity_id: {
                                    oneOf: [{ type: "string" }, { type: "object" }]
                                }
                            }
                        }
                    }
                }
            }
        };
    }
    static validate(spec) {
        const ajv = new ajv_1.default({ allErrors: true });
        (0, ajv_formats_1.default)(ajv);
        const validate = ajv.compile(CreateIndexNode.schema);
        const validation = validate(spec);
        return [validation, JSON.stringify(validate.errors)];
    }
    validate() {
        return CreateIndexNode.validate(this._spec);
    }
    _preProcessing({ bag, input, actor_data, environment, parameters }) {
        return engine_1.utils.prepare(this._spec.parameters.input, {
            bag: bag,
            result: input,
            actor_data,
            environment,
            parameters
        });
    }
    run(_a) {
        return __awaiter(this, arguments, void 0, function* ({ bag = {}, input = {}, actor_data = {}, environment = {}, process_id = null, parameters = {} }) {
            const hrt_run_start = process.hrtime();
            try {
                logger_1.logger.debug("[Indexer] createIndex Node");
                const executionData = this._preProcessing({
                    bag,
                    input,
                    actor_data,
                    environment,
                    parameters
                });
                const indexObj = {
                    entity_type: executionData.entity_type,
                    entity_id: executionData.entity_id,
                    process_id
                };
                const _idx = new indexer_1.Index(db_1.db);
                const result = yield _idx.createIndex(indexObj);
                const hrt_run_interval = process.hrtime(hrt_run_start);
                const time_elapsed = Math.ceil(hrt_run_interval[0] * 1000 + hrt_run_interval[1] / 1000000);
                return {
                    node_id: this.id,
                    bag: bag,
                    external_input: null,
                    result: result,
                    error: null,
                    status: engine_1.ProcessStatus.RUNNING,
                    next_node_id: this.next(executionData),
                    time_elapsed: time_elapsed
                };
            }
            catch (err) {
                logger_1.logger.error("Indexer failed", err);
                return this._processError(err, { bag });
            }
        });
    }
}
exports.default = CreateIndexNode;
