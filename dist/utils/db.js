"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.knexConfig = void 0;
const path_1 = __importDefault(require("path"));
const env_1 = require("../config/env");
require("ts-node/register");
const knex_1 = __importDefault(require("knex"));
const BASE_PATH = path_1.default.join(__dirname, "db");
exports.knexConfig = {
    client: "pg",
    connection: {
        host: env_1.envs.DB_HOST,
        port: env_1.envs.DB_PORT,
        user: env_1.envs.DB_USER,
        password: env_1.envs.DB_PASSWORD,
        database: env_1.envs.DB_DATABASE
    },
    migrations: {
        directory: path_1.default.join(BASE_PATH, "migrations")
    },
    pool: {
        min: 0,
        max: env_1.envs.DB_MAX_POOL_CONNECTION
    },
    seeds: {
        directory: path_1.default.join(BASE_PATH, "seeds")
    }
};
exports.db = (0, knex_1.default)(exports.knexConfig);
