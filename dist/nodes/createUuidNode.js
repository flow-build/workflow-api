"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const logger_1 = require("../utils/logger");
const engine_1 = require("@flowbuild/engine");
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const nanoid_1 = require("nanoid");
const uuid = __importStar(require("uuid"));
class CreateUuidNode extends engine_1.Nodes.SystemTaskNode {
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
                            required: ["type"],
                            properties: {
                                type: { type: "string", enum: ["uuid", "nanoid"] },
                                options: {
                                    type: "object",
                                    properties: {
                                        version: { type: "string", enum: ["v1", "v4"] },
                                        size: {
                                            oneOf: [{ type: "integer" }, { type: "object" }]
                                        }
                                    }
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
        const validate = ajv.compile(CreateUuidNode.schema);
        const validation = validate(spec);
        return [validation, JSON.stringify(validate.errors)];
    }
    validate() {
        return CreateUuidNode.validate(this._spec);
    }
    _run(executionData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            let result = { id: '' };
            function getVersion(uVersion) {
                if (!uVersion)
                    return uuid.v1();
                const version = {
                    v1: () => uuid.v1(),
                    v4: () => uuid.v4()
                };
                return (version[uVersion] || uuid.v1)();
            }
            try {
                if (executionData.type === "nanoid") {
                    if ((_a = executionData.options) === null || _a === void 0 ? void 0 : _a.size) {
                        result.id = (0, nanoid_1.nanoid)(executionData.options.size);
                    }
                    else {
                        result.id = (0, nanoid_1.nanoid)();
                    }
                }
                else {
                    result.id = getVersion((_b = executionData.options) === null || _b === void 0 ? void 0 : _b.version);
                }
            }
            catch (error) {
                logger_1.logger.error("NODE.ERROR", `ERROR AT NID [${this.id}] | CREATE UUID | unexpected error`, {
                    node_id: this.id,
                    error: error
                });
                throw new Error(error);
            }
            return [result, engine_1.ProcessStatus.RUNNING];
        });
    }
}
exports.default = CreateUuidNode;
