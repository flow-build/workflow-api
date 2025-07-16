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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodes_1 = require("../src/nodes");
const env_1 = require("./config/env");
const persist_1 = require("./middlewares/persist");
const userAgent_1 = require("./middlewares/userAgent");
const cockpitRouter_1 = __importDefault(require("./routers/cockpitRouter"));
const freeRouter_1 = __importDefault(require("./routers/freeRouter"));
const mainRouter_1 = __importDefault(require("./routers/mainRouter"));
const broker = __importStar(require("./services/broker"));
const cockpitService = __importStar(require("./services/cockpit"));
const db_1 = require("./utils/db");
const engineListener_1 = require("./utils/engineListener");
const engineLogger_1 = require("./utils/engineLogger");
const jwtSecret_1 = require("./utils/jwtSecret");
const engine_1 = require("./engine");
const engine_2 = require("@flowbuild/engine");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_jwt_1 = require("express-jwt");
const helmet_1 = __importDefault(require("helmet"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, persist_1.setPersist)(db_1.db));
app.use(userAgent_1.captureUserAgentAndIp);
const engineLogLevel = env_1.envs.FLOWBUILD.LOGS.LOG_LEVEL;
(0, engineLogger_1.startLogger)();
let engine = (0, engine_1.getEngine)();
if (!engine) {
    engine = new engine_2.Engine("knex", db_1.db, engineLogLevel);
    (0, engine_1.setEngine)(engine);
}
let cockpit = (0, engine_1.getCockpit)();
if (!cockpit) {
    cockpit = new engine_2.Cockpit("knex", db_1.db, engineLogLevel);
    (0, engine_1.setCockpit)(cockpit);
    cockpitService.setDbConnection(db_1.db);
}
(0, nodes_1.setCustomNodes)();
broker.connect();
(0, engineListener_1.activateNotifiers)(engine);
const crypto = engine.buildCrypto("aes-256-cbc", {
    key: process.env.CRYPTO_KEY || "12345678901234567890123456789012"
});
engine.setCrypto(crypto);
const corsOptions = {
    origin: "*",
    allowMethods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowHeaders: [
        "Content-Type",
        "Authorization",
        "Accept",
        "x-duration",
        "x-secret"
    ],
    exposedHeaders: ["forbbiden-reason"]
};
app.disable("x-powered-by");
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(freeRouter_1.default);
app.use((0, express_jwt_1.expressjwt)({
    credentialsRequired: jwtSecret_1.jwtPassthrough,
    secret: jwtSecret_1.jwtSecret,
    algorithms: [jwtSecret_1.jwtAlgorithms]
}));
app.use(mainRouter_1.default);
app.use("/cockpit", cockpitRouter_1.default);
exports.default = app;
