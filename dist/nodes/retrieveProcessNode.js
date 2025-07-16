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
class RetrieveProcessesNode extends engine_1.Nodes.SystemTaskNode {
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
                            required: ["entity_id"],
                            properties: {
                                entity_id: {
                                    oneOf: [
                                        { type: "string", format: "uuid" },
                                        {
                                            type: "object",
                                            properties: {
                                                $ref: { type: "string" }
                                            }
                                        }
                                    ]
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
        const validate = ajv.compile(RetrieveProcessesNode.schema);
        const validation = validate(spec);
        return [validation, JSON.stringify(validate.errors)];
    }
    validate() {
        return RetrieveProcessesNode.validate(this._spec);
    }
    _run(executionData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.logger.debug("[Indexer] retrieveProcesses node");
                const _idx = new indexer_1.Index(db_1.db);
                const result = yield _idx.fetchProcessByEntity(executionData.entity_id, executionData.limit);
                return [{ data: result }, engine_1.ProcessStatus.RUNNING];
            }
            catch (err) {
                logger_1.logger.error("retrieveProcesses node failed", err);
                throw err;
            }
        });
    }
}
exports.default = RetrieveProcessesNode;
