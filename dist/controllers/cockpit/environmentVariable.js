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
exports.saveEnvironmentVariable = saveEnvironmentVariable;
exports.getEnvironmentVariables = getEnvironmentVariables;
exports.getEnvironmentVariable = getEnvironmentVariable;
exports.deleteEnvironmentVariable = deleteEnvironmentVariable;
const engine_1 = require("../../engine");
const logger_1 = require("../../utils/logger");
require("../../types/express");
function serializeEnv(env) {
    const variable = {
        key: env.key,
        value: env.value,
        type: env.type,
        origin: env._origin
    };
    if ((env === null || env === void 0 ? void 0 : env._origin) !== "environment") {
        variable.created_at = env.created_at;
        variable.updated_at = env._updated_at;
    }
    return variable;
}
function saveEnvironmentVariable(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("called saveEnvironmentVariable");
        const { key, value } = req.body;
        const cockpit = (0, engine_1.getCockpit)();
        try {
            const existingEnvironmentVariable = yield cockpit.fetchEnvironmentVariable(key);
            let environmentVariable;
            if (!existingEnvironmentVariable || existingEnvironmentVariable._origin === "environment") {
                logger_1.logger.debug("Environment Variable Created");
                environmentVariable = yield cockpit.createEnvironmentVariable(key, value);
                res.status(201);
            }
            else {
                logger_1.logger.debug("Environment Variable Updated");
                environmentVariable = yield cockpit.updateEnvironmentVariable(key, value);
                res.status(200);
            }
            res.json(serializeEnv(environmentVariable));
        }
        catch (err) {
            res.status(500).json({ message: `Failed at ${err.message}`, error: err });
        }
        return next();
    });
}
function getEnvironmentVariables(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("called getEnvironmentVariables");
        const cockpit = (0, engine_1.getCockpit)();
        try {
            const environmentVariables = yield cockpit.fetchAllEnvironmentVariables();
            res.status(200).json(environmentVariables.map((env) => serializeEnv(env)));
        }
        catch (err) {
            res.status(500).json({ message: `Failed at ${err.message}`, error: err });
        }
        return next();
    });
}
function getEnvironmentVariable(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("called getEnvironmentVariable");
        const { key } = req.params;
        const cockpit = (0, engine_1.getCockpit)();
        try {
            const environmentVariable = yield cockpit.fetchEnvironmentVariable(key);
            if (environmentVariable) {
                res.status(200).json(serializeEnv(environmentVariable));
            }
            else {
                res.status(404).json({ message: "Environment variable not found" });
            }
        }
        catch (err) {
            res.status(500).json({ message: `Failed at ${err.message}`, error: err });
        }
        return next();
    });
}
function deleteEnvironmentVariable(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("called deleteEnvironmentVariable");
        const { key } = req.params;
        const cockpit = (0, engine_1.getCockpit)();
        try {
            const environmentVariable = yield cockpit.fetchEnvironmentVariable(key);
            if (!environmentVariable) {
                res.status(404).json({ message: "Environment variable not found" });
            }
            else {
                yield cockpit.deleteEnvironmentVariable(key);
                res.status(204).send();
            }
        }
        catch (err) {
            res.status(500).json({ message: `Failed at ${err.message}`, error: err });
        }
        return next();
    });
}
