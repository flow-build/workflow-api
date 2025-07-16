import path from "path"

import { envs } from "../config/env"

import "ts-node/register"
import knex, { Knex } from "knex"
const BASE_PATH = path.join(__dirname, "db")

export const knexConfig: Knex.Config = {
  client: "pg",
  connection: {
    host: envs.DB_HOST,
    port: envs.DB_PORT,
    user: envs.DB_USER,
    password: envs.DB_PASSWORD,
    database: envs.DB_DATABASE
  },
  migrations: {
    directory: path.join(BASE_PATH, "migrations")
  },
  pool: {
    min: 0,
    max: envs.DB_MAX_POOL_CONNECTION
  },
  seeds: {
    directory: path.join(BASE_PATH, "seeds")
  }
}

export const db = knex(knexConfig)
