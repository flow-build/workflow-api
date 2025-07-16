"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const env_1 = require("../config/env");
const winston_1 = require("winston");
exports.logger = (0, winston_1.createLogger)({
    level: env_1.envs.LOG_LEVEL || "info",
    format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.timestamp(), winston_1.format.label({ label: "API", message: true }), winston_1.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)),
    transports: [new winston_1.transports.Console()],
    exceptionHandlers: [
        new winston_1.transports.Console({
            format: winston_1.format.errors()
        })
    ],
    rejectionHandlers: [new winston_1.transports.Console()]
});
