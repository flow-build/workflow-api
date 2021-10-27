const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { logger } = require("../utils/logger");
const { validate } = require("uuid");

const validateBodyWithSchema = (schema) => {
  return async (ctx, next) => {
    logger.debug("called validateBodySchema");
    const _ajv = new Ajv({ allErrors: true });
    addFormats(_ajv);
    const validateSchema = _ajv.compile(schema);
    const is_valid = await validateSchema(ctx.request.body);
    if (!is_valid) {
      logger.debug("invalid schema # %i errors", validateSchema.errors.length);
      ctx.status = 400;
      ctx.body = {
        message: "Invalid Request Body",
        error: validateSchema.errors.map((e) => {
          let response;
          response = {
            field: e.instancePath,
            message: e.message,
          };
          return response;
        }),
      };
      return;
    }
    return await next();
  };
};

validateDataWithSchema = async (schema, data) => {
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

validateUUID = async (ctx, next) => {
  const id = ctx.params.id || ctx.request.query.workflow_id;
  logger.debug(`validating id [${id}]`);
  if (id) {
    const is_valid = validate(id);
    if (!is_valid) {
      ctx.status = 400;
      ctx.body = {
        message: "Invalid uuid",
      };
    } else {
      return await next();
    }
  } else {
    return next();
  }
};

module.exports = {
  validateBodyWithSchema: validateBodyWithSchema,
  validateUUID,
  validateDataWithSchema,
};
