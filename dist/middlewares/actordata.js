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
exports.captureActorData = captureActorData;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
require("../types/express");
const lodash_1 = require("lodash");
const customMap = {
    actor_id: env_1.envs.JWT.PATH.ACTOR_ID,
    claims: env_1.envs.JWT.PATH.CLAIMS,
    session_id: env_1.envs.JWT.PATH.SESSION_ID
};
function captureActorData(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.debug("[middleware actorData] captureActorData");
        if (!req.auth) {
            logger_1.logger.debug("empty token payload");
            res.status(401).send({ message: "User data not found" });
            return;
        }
        const defaultData = mapDefaultData(req);
        if (!defaultData.actorId) {
            logger_1.logger.debug("no actor_id");
            res.status(401).send({ message: "Actor id not found" });
            return;
        }
        if (!Array.isArray(defaultData.claims)) {
            logger_1.logger.debug("invalid claims");
            res.status(401).send({ message: "Invalid claims" });
            return;
        }
        if (req.actorData) {
            req.actorData["actorId"] = defaultData.actorId;
            req.actorData["claims"] = defaultData.claims;
            req.actorData.trace = defaultData.trace;
            req.actorData["sessionId"] = defaultData.sessionId;
        }
        else {
            req.actorData = defaultData;
        }
        req.actorData.extData = mapExtraData(req.auth);
        return next();
    });
}
;
function mapDefaultData(req) {
    const actorId = (0, lodash_1.get)(req.auth, customMap.actor_id);
    const claims = (0, lodash_1.get)(req.auth, customMap.claims);
    const sessionId = (0, lodash_1.get)(req.auth, customMap.session_id);
    const trace = {
        tracestate: req.headers.tracestate,
        traceparent: req.headers.traceparent
    };
    return { actorId, claims, sessionId, trace };
}
;
function mapExtraData(user) {
    let keys;
    if (!env_1.envs.JWT.EXTRA_KEYS || env_1.envs.JWT.EXTRA_KEYS.length === 0) {
        const allkeys = Object.keys(user);
        const defaultKeys = Object.values(customMap);
        keys = allkeys.filter(key => !defaultKeys.includes(key));
    }
    else {
        keys = env_1.envs.JWT.EXTRA_KEYS;
    }
    const extData = {};
    if (keys && keys.length > 0) {
        for (const key of keys) {
            if (user[key]) {
                extData[key] = user[key];
            }
        }
    }
    return extData;
}
;
