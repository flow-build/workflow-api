const Ajv = require("ajv/dist/2019");
const addFormats = require("ajv-formats");
const { logger } = require("../utils/logger");
const { validate } = require("uuid");

const validateRequestFieldWithSchema = (schema, ...propertiesList) => {
  return async (ctx, next) => {
    const propertiesListString = propertiesList.join(' ')
    logger.debug(`called validateRequestFieldWithSchema [${propertiesListString}]`);

    const _ajv = new Ajv({ allErrors: true });
    addFormats(_ajv);
    const validateSchema = _ajv.compile(schema);

    const field = propertiesList.reduce((obj, key) => obj[key], ctx)
    const is_valid = await validateSchema(field);

    if (is_valid) {
      return next();
    }

    logger.debug(`Invalid schema # ${validateSchema.errors.length} errors`);
    ctx.status = 400;
    ctx.body = {
      message: `Invalid ${propertiesListString}`,
      error: validateSchema.errors.map(error => ({
        field: error.instancePath || error.params?.unevaluatedProperty,
        message: error.message,
      })),
    };
  };
};

const validateBodyWithSchema = (schema) => validateRequestFieldWithSchema(schema, 'request', 'body')
const validateQueryWithSchema = (schema) => validateRequestFieldWithSchema(schema, 'request', 'query')

const validateDataWithSchema = async (schema, data) => {
  logger.silly("called validateSchema");

  const _ajv = new Ajv({ allErrors: true });
  addFormats(_ajv);
  const validateSchema = _ajv.compile(schema);

  const is_valid = await validateSchema(data);
  return {
    is_valid: is_valid,
    errors: validateSchema.errors,
  };
};

const validateUUID = async (ctx, next) => {
  const id = ctx.params.id || ctx.request.query.workflow_id;
  logger.debug(`validating id [${id}]`);

  if (!id || validate(id)) {
    return next();
  }

  ctx.status = 400;
  ctx.body = {
    message: "Invalid uuid",
  };
};

module.exports = {
  validateBodyWithSchema,
  validateQueryWithSchema,
  validateUUID,
  validateDataWithSchema,
};
