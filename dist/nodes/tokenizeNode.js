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
const tokenGenerator_1 = require("../services/tokenGenerator");
const jwtSecret_1 = require("../utils/jwtSecret");
const logger_1 = require("../utils/logger");
const engine_1 = require("@flowbuild/engine");
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const nanoid_1 = require("nanoid");
const uuid_1 = require("uuid");
class TokenizeNode extends engine_1.Nodes.SystemTaskNode {
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
                    required: ["input"],
                    properties: {
                        input: { type: "object" }
                    }
                }
            }
        };
    }
    static validate(spec) {
        const ajv = new ajv_1.default({ allErrors: true });
        (0, ajv_formats_1.default)(ajv);
        const validate = ajv.compile(TokenizeNode.schema);
        const validation = validate(spec);
        return [validation, JSON.stringify(validate.errors)];
    }
    validate() {
        return TokenizeNode.validate(this._spec);
    }
    _run(executionData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const duration = parseInt(executionData.duration) || 3600;
                let secret = executionData.secret;
                if (!executionData.secret) {
                    logger_1.logger.debug("[tokenizeNode] Using default secret");
                    secret = jwtSecret_1.jwtSecret;
                }
                if (!executionData.session_id) {
                    logger_1.logger.debug("[tokenizeNode] Set a random session_id");
                    executionData.session_id = (0, nanoid_1.nanoid)();
                }
                if (!executionData.actor_id) {
                    logger_1.logger.debug("[tokenizeNode] Set a random actor_id");
                    executionData.actor_id = (0, uuid_1.v1)();
                }
                if (!executionData.claims) {
                    logger_1.logger.debug("[tokenizeNode] Set an empty claims list");
                    executionData.claims = [];
                }
                const jwtToken = (0, tokenGenerator_1.createJWTToken)({ payload: executionData, secret, duration });
                const result = {
                    jwtToken,
                    payload: executionData
                };
                return [{ data: result }, engine_1.ProcessStatus.RUNNING];
            }
            catch (err) {
                logger_1.logger.error("[tokenizeNode] Node failed", err);
                throw err;
            }
        });
    }
}
exports.default = TokenizeNode;
