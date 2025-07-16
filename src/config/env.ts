import "dotenv/config"
import * as jwt from "jsonwebtoken"

export const envs = {
  DB_CLIENT: process.env.DB_CLIENT ?? "pg",
  DB_HOST: process.env.DB_HOST as string,
  DB_USER: process.env.DB_USER as string,
  DB_PASSWORD: process.env.DB_PASSWORD as string,
  DB_DATABASE: process.env.DB_DATABASE as string,
  DB_PORT: parseInt(process.env.DB_PORT ?? "5432", 10),
  DB_MAX_POOL_CONNECTION: parseInt(process.env.DB_MAX_POOL_CONNECTION ?? "10", 10),
  LOG_LEVEL: (process.env.LOG_LEVEL ?? "INFO"),
  APP_PORT: parseInt(process.env.APP_PORT ?? "3000", 10),
  APP_NAME: process.env.APP_NAME ?? "my-app",
  KNEX_ENV: process.env.KNEX_ENV ?? "local",
  COGNITO: {
    POOL_ID: process.env.COGNITO_USER_POOL_ID ?? "",
    CLIENT_ID: process.env.COGNITO_CLIENT_ID ?? "",
    CLIENT_SECRET: process.env.COGNITO_CLIENT_SECRET ?? ""
  },
  JWT: {
    KEY: process.env.JWT_KEY || "1234",
    ALG: process.env.JWT_ALG as jwt.Algorithm,
    PASSTHROUGH: process.env.JWT_PASSTHROUGH === "true",
    EXTRA_KEYS: process.env.JWT_EXTRA_KEYS ? process.env.JWT_EXTRA_KEYS.split(",") : [],
    PATH: {
      ACTOR_ID: process.env.JWT_PATH_ACTOR_ID ?? "actor_id",
      CLAIMS: process.env.JWT_PATH_CLAIMS ?? "claims",
      SESSION_ID: process.env.JWT_PATH_SESSION_ID ?? "session_id"
    }
  },
  FLOWBUILD: {
    URL: process.env.FLOWBUILD_URL,
    EVENTS: {
      NAMESPACE: process.env.WORKFLOW_EVENTS_NAMESPACE || process.env.NODE_ENV || "development",
      BROKER: process.env.WORKFLOW_EVENTS_BROKER ?? "MQTT"
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
      BROKER: process.env.ENGINE_LOGS_BROKER ?? "MQTT"
    }
  },
  TIMERS: {
    BATCH: parseInt(process.env.TIMER_BATCH ?? "0"),
    QUEUE: process.env.TIMER_QUEUE
  },
  KAFKA: {
    ENABLED: process.env.KAFKA === "true",
    API_KEY: process.env.KAFKA_CLUSTER_API_KEY ?? "",
    API_SECRET: process.env.KAFKA_API_SECRET ?? "",
    BOOTSTRAP_SERVER: process.env.KAFKA_BOOTSTRAP_SERVER ?? "",
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
    QUEUE: process.env.QUEUE ?? "",
    HOST: process.env.HOST,
    USERNAME: process.env.USERNAME,
    PASSWORD: process.env.PASSWORD
  },
  ECS: {
    TASK_ID: process.env.ECS_TASK_ID
  },
  OTEL: {
    ENABLED: process.env.OTEL_ENABLED === "true",
    URL: process.env.OTEL_COLLECTOR_URL ?? "http://localhost:4317",
    SERVICE_NAME: process.env.OTEL_SERVICE_NAME
  },
  NEW_RELIC: {
    ENABLED: process.env.NEW_RELIC_ENABLED === "true",
    API_KEY: process.env.NEW_RELIC_API_KEY ?? ""
  }
}
