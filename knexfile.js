const path = require("path");
const BASE_PATH = path.join(__dirname, "db");

module.exports = {
  test: {
    client: "pg",
    connection: {
      host: process.env.POSTGRES_HOST || "0.0.0.0",
      port: process.env.POSTGRES_PORT || "5432",
      user: process.env.POSTGRES_USER || "postgres",
      password: process.env.POSTGRES_PASSWORD || "postgres",
      database: process.env.POSTGRES_DATABASE || "workflow",
    },
    migrations: {
      directory: path.join(BASE_PATH, "migrations"),
    },
    seeds: {
      directory: path.join(BASE_PATH, "seeds"),
    },
  },
  docker: {
    client: "pg",
    connection: {
      host: "flowbuild_db",
      user: "postgres",
      password: "postgres",
      database: "workflow",
    },
    migrations: {
      directory: path.join(BASE_PATH, "migrations"),
    },
    seeds: {
      directory: path.join(BASE_PATH, "seeds"),
    },
  },
  dockerLocal: {
    client: "pg",
    connection: {
      host: "localhost",
      user: "postgres",
      password: "postgres",
      database: "workflow",
      port: 5432,
    },
    pool: {
      min: 0,
      max: 40,
      acquireTimeoutMillis: 60000,
      idleTimeoutMillis: 600000,
    },
    migrations: {
      directory: path.join(BASE_PATH, "migrations"),
    },
    seeds: {
      directory: path.join(BASE_PATH, "seeds"),
    },
  },
};
