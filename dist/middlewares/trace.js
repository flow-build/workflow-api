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
exports.captureTraceData = captureTraceData;
const logger_1 = require("../utils/logger");
require("../types/express");
const traceparent_1 = __importDefault(require("traceparent"));
function captureTraceData(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        logger_1.logger.debug("[middleware trace] captureTraceData");
        const tracesettings = { transactionSampleRate: 1 };
        let parent;
        const traceparentHeader = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.traceparent;
        if (traceparentHeader) {
            logger_1.logger.silly("old traceparent: ", traceparentHeader);
            if (Array.isArray(traceparentHeader)) {
                parent = traceparent_1.default.fromString(traceparentHeader[0]);
            }
            else {
                parent = traceparent_1.default.fromString(traceparentHeader);
            }
        }
        else {
            logger_1.logger.silly("no traceparent: ");
        }
        const _traceparent = traceparent_1.default.startOrResume(parent, tracesettings);
        const trace = {
            tracestate: req.headers.tracestate,
            traceparent: _traceparent.toString()
        };
        if (req.actorData) {
            req.actorData.trace = trace;
        }
        else {
            req.actorData = {
                trace: trace
            };
        }
        logger_1.logger.silly("new traceparent: ", traceparent_1.default.toString());
        return next();
    });
}
