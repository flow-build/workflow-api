"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtPassthrough = exports.jwtAlgorithms = exports.jwtSecret = void 0;
const env_1 = require("../config/env");
const logger_1 = require("./logger");
exports.jwtSecret = setJwtSecret();
function setJwtSecret() {
    let jwtSecret = env_1.envs.JWT.KEY;
    if (env_1.envs.JWT.ALG === "RS256") {
        logger_1.logger.info("using RS256, switching secretKey to certificate");
        const pemHeader = "-----BEGIN PUBLIC KEY-----";
        const pemFooter = "-----END PUBLIC KEY-----";
        const t0 = pemHeader + "\n" + env_1.envs.JWT.KEY + "\n" + pemFooter;
        jwtSecret = Buffer.from(t0);
    }
    return jwtSecret;
}
exports.jwtAlgorithms = env_1.envs.JWT.ALG;
exports.jwtPassthrough = env_1.envs.JWT.PASSTHROUGH;
