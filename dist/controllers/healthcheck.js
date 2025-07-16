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
exports.healthcheck = healthcheck;
const package_json_1 = __importDefault(require("../../package.json"));
const env_1 = require("../config/env");
const engine_1 = require("../engine");
const broker_1 = require("../services/broker");
const logger_1 = require("../utils/logger");
require("../types/express");
function healthcheck(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        logger_1.logger.verbose("[controllers healthcheck] called healthcheck");
        const engine = (0, engine_1.getEngine)();
        const cockpit = (0, engine_1.getCockpit)();
        const brokerClient = (0, broker_1.getClient)();
        const expiredTimers = yield cockpit.fetchTimersReady();
        const activeTimers = yield cockpit.fetchTimersActive();
        let rabbitMQ, broker = undefined;
        if (env_1.envs.MQ.ENABLED) {
            rabbitMQ = {
                status: true,
                hostname: env_1.envs.MQ.HOST,
                queue: env_1.envs.MQ.QUEUE
            };
            broker = {
                activityManager: env_1.envs.FLOWBUILD.ACTIVITY_MANAGER.BROKER,
                processState: env_1.envs.FLOWBUILD.PROCESS_STATE.BROKER,
                engineLogs: env_1.envs.FLOWBUILD.LOGS.BROKER
            };
        }
        const body = {
            "message": "Flowbuild API is fine!",
            "version": package_json_1.default.version,
            "engine": {
                version: package_json_1.default.dependencies["@flowbuild/engine"],
                latestEvent: engine.emitter.event
            },
            "timers": {
                batch: env_1.envs.TIMERS.BATCH,
                queue: env_1.envs.TIMERS.QUEUE,
                ready: env_1.envs.TIMERS.BATCH === 0 ? expiredTimers.length : "engine timer processing disabled",
                active: activeTimers.length
            },
            "diagram-builder": package_json_1.default.dependencies["@flowbuild/nodejs-diagram-builder"],
            "indexer": package_json_1.default.dependencies["@flowbuild/indexer"],
            "mqtt": {
                status: env_1.envs.MQTT.ENABLED,
                hostname: (_a = brokerClient === null || brokerClient === void 0 ? void 0 : brokerClient.options) === null || _a === void 0 ? void 0 : _a.hostname,
                protocol: (_b = brokerClient === null || brokerClient === void 0 ? void 0 : brokerClient.options) === null || _b === void 0 ? void 0 : _b.protocol,
                client: (_c = brokerClient === null || brokerClient === void 0 ? void 0 : brokerClient.options) === null || _c === void 0 ? void 0 : _c.clientId
            },
            rabbitMQ,
            "configuration": {
                logLevels: {
                    engine: process.env.ENGINE_LOG_LEVEL,
                    server: process.env.KOA_LOG_LEVEL,
                    pushStateEvents: process.env.PUBLISH_STATE_EVENTS,
                    pushEngineLogs: process.env.PUBLISH_ENGINE_LOGS,
                    pushServerLogs: process.env.PUBLISH_SERVER_LOGS
                },
                engine: {
                    heartbeat: process.env.ENGINE_HEARTBEAT,
                    maxStepNumber: process.env.MAX_STEP_NUMBER
                },
                httpNodes: {
                    maxLength: process.env.MAX_CONTENT_LENGTH,
                    timeout: process.env.HTTP_TIMEOUT,
                    maxBody: process.env.MAX_BODY_LENGTH
                },
                OpenTelemetry: {
                    status: process.env.OTEL_ENABLED === "true" ? "enabled" : "disabled",
                    serviceName: process.env.OTEL_SERVICE_NAME,
                    newRelic: process.env.NEW_RELIC_ENABLED === "true" ? "active" : "inactive",
                    collector: process.env.OTEL_COLLECTOR_URL
                },
                broker
            }
        };
        if (env_1.envs.FLOWBUILD.MAX_READY_TIMERS && expiredTimers.length > env_1.envs.FLOWBUILD.MAX_READY_TIMERS) {
            res.status(409).send(body);
            return next();
        }
        res.status(200);
    });
}
;
