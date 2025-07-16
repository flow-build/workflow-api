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
exports.validateBodyWithSchema = validateBodyWithSchema;
exports.validateDataWithSchema = validateDataWithSchema;
exports.validateUUID = validateUUID;
const logger_1 = require("../utils/logger");
require("../types/express");
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const uuid_1 = require("uuid");
function validateBodyWithSchema(schema) {
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        logger_1.logger.debug("[validators base] called validateBodySchema");
        const _ajv = new ajv_1.default({ allErrors: true, allowUnionTypes: true });
        (0, ajv_formats_1.default)(_ajv);
        const validateSchema = _ajv.compile(schema);
        if (!validateSchema)
            throw new Error("No schema");
        const is_valid = yield validateSchema(req.body);
        if (!is_valid) {
            logger_1.logger.debug("invalid schema # %i errors", (_a = validateSchema.errors) === null || _a === void 0 ? void 0 : _a.length);
            res.status(400).send({
                message: "Invalid Request Body",
                error: (_b = validateSchema.errors) === null || _b === void 0 ? void 0 : _b.map((e) => {
                    return {
                        field: e.instancePath,
                        message: e.message
                    };
                })
            });
            return;
        }
        return next();
    });
}
;
function validateDataWithSchema(schema, data) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.silly("[validators base] called validateSchema");
        const _ajv = new ajv_1.default({ allErrors: true });
        (0, ajv_formats_1.default)(_ajv);
        const validateSchema = _ajv.compile(schema);
        const is_valid = yield validateSchema(data);
        return {
            isValid: is_valid,
            errors: validateSchema.errors
        };
    });
}
;
function validateUUID(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.debug(`[validators base] called validateUUID`);
        const id = req.params.id || req.query.workflow_id;
        if (id) {
            const is_valid = (0, uuid_1.validate)(id);
            if (!is_valid) {
                res.status(400).send({ message: "Invalid uuid" });
                return;
            }
        }
        return next();
    });
}
;
