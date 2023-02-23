const pkg = require('../../package.json');
const { logger } = require('../utils/logger');
const { getClient } = require('../services/mqtt')
const { getEngine, getCockpit } = require("../engine");

const healthCheck = async (ctx, next) => {
  logger.verbose('Called healthCheck');
  
  const engine = getEngine();
  const cockpit = getCockpit();
  const mqttClient = getClient();

  const expiredTimers = await cockpit.fetchTimersReady();
  const activeTimers = await cockpit.fetchTimersActive();

  ctx.body = {
    message: 'Flowbuild API is fine!',
    version: pkg.version,
    engine: {
      version: pkg.dependencies['@flowbuild/engine'],
      latestEvent: engine.emitter.event
    },
    timers: {
      ready: expiredTimers.length,
      active: activeTimers.length
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
        status: process.env.OTEL_ENABLED === "true" ? "enabled" : "disabled",
        serviceName: process.env.OTEL_SERVICE_NAME,
        newRelic: process.env.NEW_RELIC_ENABLED === "true" ? "active" : "inactive",
        collector: process.env.OTEL_COLLECTOR_URL
      }
    }
  }

  if(process.env.MAX_READY_TIMERS && expiredTimers.length > process.env.MAX_READY_TIMERS) {
    ctx.status = 409;
    return next();
  }

  ctx.status = 200;

  return next();
};

module.exports = {
  healthCheck
}