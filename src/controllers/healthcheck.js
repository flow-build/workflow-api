const pkg = require('../../package.json');
const { logger } = require('../utils/logger');
const { getClient } = require('../services/mqtt')
const { getEngine } = require("../engine");

const healthCheck = async (ctx, next) => {
  logger.verbose('Called healthCheck');
  ctx.status = 200;
  const engine = getEngine();
  const mqttClient = getClient();
  ctx.body = {
    message: 'Flowbuild API is fine!',
    version: pkg.version,
    engine: {
      version: pkg.dependencies['@flowbuild/engine'],
      latestEvent: engine.emitter.event
    },
    'diagram-builder': pkg.dependencies['@flowbuild/nodejs-diagram-builder'],
    'indexer': pkg.dependencies['@flowbuild/indexer'],
    mqtt: {
      status: process.env.MQTT,
      hostname: mqttClient?._client?.options?.hostname,
      protocol: mqttClient?._client?.options?.protocol,
      client: mqttClient?._client?.options?.clientId
    },
    configuration: {
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
        status: process.env.OTEL_ENABLED === true ? "enabled" : "disabled",
        serviceName: process.env.OTEL_SERVICE_NAME,
        newRelic: process.env.NEW_RELIC_ENABLED === true ? "active" : "inactive",
        collector: process.env.OTEL_COLLECTOR_URL
      }
    }
  }

  return next();
};

module.exports = {
  healthCheck
}