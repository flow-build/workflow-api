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
    mqtt: {
      status: process.env.MQTT,
      hostname: mqttClient?._client?.options?.hostname,
      protocol: mqttClient?._client?.options?.protocol,
      client: mqttClient?._client?.options?.clientId
    },
    
  }

  return next();
};

module.exports = {
  healthCheck
}