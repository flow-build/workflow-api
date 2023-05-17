require("dotenv").config();
const { logger } = require("../../utils/logger");
const { getCockpit } = require("../../engine");
const _ = require("lodash");

const serializeEnv = (env) => {
  const variable = {
    key: env.key,
    value: env.value,
    type: env.type,
    origin: env._origin,
  }

  if (env?._origin !== 'environment') {
    variable.created_at = env.created_at;
    variable.updated_at = env._updated_at;
  }

  return variable;
};

const serializeAllEnvs = (environmentEnvs) => {
  const allEnvs = environmentEnvs?.map((env) => {
    return {
      key: env?.key,
      value: env?.value,
      type: env?.type,
      origin: env?._origin,
    }
  });

  Object.entries(process.env).map(([key, value]) => {
    const tableEnv = allEnvs?.find((env) => env.key === key);
    if (!tableEnv) {
      allEnvs.push({ key, value, origin: 'environment' });
    }
  });

  return allEnvs;
};

const saveEnvironmentVariable = async (ctx, next) => {
  logger.verbose("called saveEnvironmentVariable");

  const { key, value } = ctx.request.body;
  const cockpit = getCockpit();

  try {
    const existingEnvironmentVariable = await cockpit.fetchEnvironmentVariable(key);
    let environmentVariable;

    if (!existingEnvironmentVariable || existingEnvironmentVariable._origin === 'environment') {
      logger.debug("Environment Variable Created");
      environmentVariable = await cockpit.createEnvironmentVariable(key, value);
      ctx.status = 201;
    } else {
      logger.debug("Environment Variable Updated");
      environmentVariable = await cockpit.updateEnvironmentVariable(key, value);
      ctx.status = 200;
    }

    ctx.body = serializeEnv(environmentVariable);
  } catch (err) {
    ctx.status = 500;
    ctx.body = { message: `Failed at ${err.message}`, error: err };
  }
  
  return next();
}

const getEnvironmentVariables = async (ctx, next) => {
  logger.verbose("called getEnvironmentVariables");

  const cockpit = getCockpit();

  try {
    const environmentVariables = await cockpit.fetchAllEnvironmentVariables();

    ctx.status = 200;
    ctx.body = serializeAllEnvs(environmentVariables);
  } catch (err) {
    ctx.status = 500;
    ctx.body = { message: `Failed at ${err.message}`, error: err };
  }
  
  return next();
}

const getEnvironmentVariable = async (ctx, next) => {
  logger.verbose("called getEnvironmentVariable");

  const { key } = ctx.request.params;
  const cockpit = getCockpit();

  try {
    const environmentVariable = await cockpit.fetchEnvironmentVariable(key);

    if (environmentVariable) {
      ctx.status = 200;
      ctx.body = serializeEnv(environmentVariable);
    } else {
      ctx.status = 404;
      ctx.body = { message: "Environment variable not found" };
    }
  } catch (err) {
    ctx.status = 500;
    ctx.body = { message: `Failed at ${err.message}`, error: err };
  }
  
  return next();
}

const deleteEnvironmentVariable = async (ctx, next) => {
  logger.verbose("called deleteEnvironmentVariable");

  const { key } = ctx.request.params;
  const cockpit = getCockpit();

  try {
    const environmentVariable = await cockpit.fetchEnvironmentVariable(key);

    if (!environmentVariable) {
      ctx.status = 404;
      ctx.body = { message: "Environment variable not found" };
    } else {
      await cockpit.deleteEnvironmentVariable(key);

      ctx.status = 204;
    }
  } catch (err) {
    ctx.status = 500;
    ctx.body = { message: `Failed at ${err.message}`, error: err };
  }
  
  return next();
}

module.exports = {
  saveEnvironmentVariable,
  getEnvironmentVariables,
  getEnvironmentVariable,
  deleteEnvironmentVariable,
};