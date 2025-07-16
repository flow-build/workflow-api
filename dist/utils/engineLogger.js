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
Object.defineProperty(exports, "__esModule", { value: true });
exports.engineLogger = void 0;
exports.startLogger = startLogger;
const env_1 = require("../config/env");
const engine_1 = require("../engine");
const broker = __importStar(require("../services/broker"));
const winston_1 = require("winston");
const engine = (0, engine_1.getEngine)();
exports.engineLogger = (0, winston_1.createLogger)({
    transports: [
        new winston_1.transports.Console({
            level: env_1.envs.FLOWBUILD.LOGS.LOG_LEVEL,
            format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.timestamp(), winston_1.format.label({ label: "ENGINE", message: true }), winston_1.format.align(), winston_1.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`))
        })
    ]
});
function startLogger() {
    exports.engineLogger.info("startLogger");
    let logLevel = "silly";
    let logMessage;
    if (env_1.envs.FLOWBUILD.LOGS.BROKER) {
        engine.emitter.onAny(function (event, message, variables) {
            const topic = `/logs`;
            const msg = {
                event,
                message,
                variables,
                timestamp: new Date()
            };
            broker.publishMessage({ topic, message: msg }, env_1.envs.FLOWBUILD.LOGS.BROKER);
        });
    }
    engine.emitter.on("PROCESS.START_NODE_RUN", (message) => {
        logLevel = "verbose";
        logMessage = message;
        exports.engineLogger[logLevel](logMessage);
    });
    engine.emitter.on("EXECUTION_LOOP.ROLLBACK", (message) => {
        logLevel = "warn";
        logMessage = message;
        exports.engineLogger[logLevel](logMessage);
    });
    engine.emitter.on("ENGINE.CONTRUCTOR", (message) => {
        logLevel = "warn";
        logMessage = message;
        exports.engineLogger[logLevel](logMessage);
    });
}
;
