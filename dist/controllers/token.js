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
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = get;
const tokenGenerator_1 = require("../services/tokenGenerator");
const jwtSecret_1 = require("../utils/jwtSecret");
const logger_1 = require("../utils/logger");
require("../types/express");
const nanoid_1 = require("nanoid");
const uuid_1 = require("uuid");
function get(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        logger_1.logger.info("[controllers token] callet get");
        const secret = req.get("x-secret") || jwtSecret_1.jwtSecret;
        const duration = parseInt((_a = req.get("x-duration")) !== null && _a !== void 0 ? _a : "3600");
        const body = req.body || {};
        if (!(body === null || body === void 0 ? void 0 : body.actor_id)) {
            body.actor_id = (0, uuid_1.v1)();
            logger_1.logger.debug("[controllers token] set a random actor_id");
        }
        if (!(body === null || body === void 0 ? void 0 : body.claims)) {
            body.claims = [];
            logger_1.logger.debug("[controllers token] set an empty claims list");
        }
        else if (!Array.isArray(body.claims)) {
            const claims = [];
            claims.push(body.claims);
            body.claims = claims;
        }
        body.session_id = (0, nanoid_1.nanoid)();
        const jwtToken = (0, tokenGenerator_1.createJWTToken)({ payload: body, secret: secret.toString(), duration });
        res.status(200).send({
            jwtToken,
            payload: body
        });
    });
}
;
