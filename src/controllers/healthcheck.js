const pkg = require('../../package.json');
const { logger } = require('../utils/logger');

const healthCheck = (ctx, next) => {
  logger.verbose('Called healthCheck');
  ctx.status = 200;
  ctx.body = {
    message: 'Koa workflow is fine!',
    version: pkg.version,
    engine: pkg.dependencies['@flowbuild/engine'],
    'diagram-builder': pkg.dependencies['@flowbuild/nodejs-diagram-builder']
  }

  return next();
};

module.exports = {
  healthCheck
}