"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
Object.defineProperty(exports, "__esModule", { value: true });
exports.envs = void 0;
require("dotenv/config");
exports.envs = {
    DB_CLIENT: (_a = process.env.DB_CLIENT) !== null && _a !== void 0 ? _a : "pg",
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_DATABASE: process.env.DB_DATABASE,
    DB_PORT: parseInt((_b = process.env.DB_PORT) !== null && _b !== void 0 ? _b : "5432", 10),
    DB_MAX_POOL_CONNECTION: parseInt((_c = process.env.DB_MAX_POOL_CONNECTION) !== null && _c !== void 0 ? _c : "10", 10),
    LOG_LEVEL: ((_d = process.env.LOG_LEVEL) !== null && _d !== void 0 ? _d : "INFO"),
    APP_PORT: parseInt((_e = process.env.APP_PORT) !== null && _e !== void 0 ? _e : "3000", 10),
    APP_NAME: (_f = process.env.APP_NAME) !== null && _f !== void 0 ? _f : "my-app",
    KNEX_ENV: (_g = process.env.KNEX_ENV) !== null && _g !== void 0 ? _g : "local",
    COGNITO: {
        POOL_ID: (_h = process.env.COGNITO_USER_POOL_ID) !== null && _h !== void 0 ? _h : "",
        CLIENT_ID: (_j = process.env.COGNITO_CLIENT_ID) !== null && _j !== void 0 ? _j : "",
        CLIENT_SECRET: (_k = process.env.COGNITO_CLIENT_SECRET) !== null && _k !== void 0 ? _k : ""
    },
    JWT: {
        KEY: process.env.JWT_KEY || "1234",
        ALG: process.env.JWT_ALG,
        PASSTHROUGH: process.env.JWT_PASSTHROUGH === "true",
        EXTRA_KEYS: process.env.JWT_EXTRA_KEYS ? process.env.JWT_EXTRA_KEYS.split(",") : [],
        PATH: {
            ACTOR_ID: (_l = process.env.JWT_PATH_ACTOR_ID) !== null && _l !== void 0 ? _l : "actor_id",
            CLAIMS: (_m = process.env.JWT_PATH_CLAIMS) !== null && _m !== void 0 ? _m : "claims",
            SESSION_ID: (_o = process.env.JWT_PATH_SESSION_ID) !== null && _o !== void 0 ? _o : "session_id"
        }
    },
    FLOWBUILD: {
        URL: process.env.FLOWBUILD_URL,
        EVENTS: {
            NAMESPACE: process.env.WORKFLOW_EVENTS_NAMESPACE || process.env.NODE_ENV || "development",
            BROKER: (_p = process.env.WORKFLOW_EVENTS_BROKER) !== null && _p !== void 0 ? _p : "MQTT"
        },
        MAX_READY_TIMERS: process.env.MAX_READY_TIMERS,
        ACTIVITY_MANAGER: {
            BROKER: process.env.ACTIVITY_MANAGER_BROKER
        },
        PROCESS_STATE: {
            BROKER: process.env.PROCESS_STATE_BROKER
        },
        LOGS: {
            LOG_LEVEL: process.env.ENGINE_LOG_LEVEL,
            BROKER: (_q = process.env.ENGINE_LOGS_BROKER) !== null && _q !== void 0 ? _q : "MQTT"
        }
    },
    TIMERS: {
        BATCH: parseInt((_r = process.env.TIMER_BATCH) !== null && _r !== void 0 ? _r : "0"),
        QUEUE: process.env.TIMER_QUEUE
    },
    KAFKA: {
        ENABLED: process.env.KAFKA === "true",
        API_KEY: (_s = process.env.KAFKA_CLUSTER_API_KEY) !== null && _s !== void 0 ? _s : "",
        API_SECRET: (_t = process.env.KAFKA_API_SECRET) !== null && _t !== void 0 ? _t : "",
        BOOTSTRAP_SERVER: (_u = process.env.KAFKA_BOOTSTRAP_SERVER) !== null && _u !== void 0 ? _u : "",
        NAMESPACE: process.env.KAFKA_NAMESPACE
    },
    MQTT: {
        ENABLED: process.env.MQTT === "true",
        HOST: process.env.MQTT_HOST,
        PORT: process.env.MQTT_PORT,
        PROTOCOL: process.env.MQTT_PROTOCOL || "ws",
        PATH: process.env.MQTT_PATH || "/mqtt",
        USERNAME: process.env.MQTT_USERNAME,
        PASSWORD: process.env.MQTT_PASSWORD,
        NAMESPACE: process.env.NAMESPACE
    },
    MQ: {
        ENABLED: process.env.AMQP === "true",
        QUEUE: (_v = process.env.QUEUE) !== null && _v !== void 0 ? _v : "",
        HOST: process.env.HOST,
        USERNAME: process.env.USERNAME,
        PASSWORD: process.env.PASSWORD
    },
    ECS: {
        TASK_ID: process.env.ECS_TASK_ID
    },
    OTEL: {
        ENABLED: process.env.OTEL_ENABLED === "true",
        URL: (_w = process.env.OTEL_COLLECTOR_URL) !== null && _w !== void 0 ? _w : "http://localhost:4317",
        SERVICE_NAME: process.env.OTEL_SERVICE_NAME
    },
    NEW_RELIC: {
        ENABLED: process.env.NEW_RELIC_ENABLED === "true",
        API_KEY: (_x = process.env.NEW_RELIC_API_KEY) !== null && _x !== void 0 ? _x : ""
    }
};
