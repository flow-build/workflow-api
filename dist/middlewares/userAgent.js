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
exports.captureUserAgentAndIp = captureUserAgentAndIp;
const logger_1 = require("../utils/logger");
require("../types/express");
const request_ip_1 = __importDefault(require("@supercharge/request-ip"));
const useragent_1 = __importDefault(require("useragent"));
function captureUserAgentAndIp(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.debug("[middleware userAgent] captureUserAgentAndIp");
        const ip = request_ip_1.default.getClientIp(req);
        const userAgentHeader = Array.isArray(req.headers["user-agent"])
            ? req.headers["user-agent"][0]
            : req.headers["user-agent"];
        const _userAgent = useragent_1.default.parse(userAgentHeader);
        const userAgent = {
            os: _userAgent.os.toString(),
            version: `${_userAgent.major}.${_userAgent.minor}`,
            family: _userAgent.family,
            device: _userAgent.device.toString()
        };
        if (req.actorData) {
            req.actorData.userAgent = userAgent;
            req.actorData.ip = ip;
        }
        else {
            req.actorData = {
                userAgent: userAgent,
                ip
            };
        }
        return next();
    });
}
;
