var Ajv = require("ajv");
const addFormats = require("ajv-formats");
const ajv = new Ajv({allErrors: true});
addFormats(ajv);

const validateBodyWithSchema = (schema) => {
  return async (ctx, next) => {
    const validateSchema = ajv.compile(schema);
    const is_valid = await validateSchema(ctx.request.body);
    if (!is_valid) {
      ctx.status = 400;
      ctx.body = { 
        message: "Invalid Request Body", 
        error: validateSchema.errors.map(e => {
          let response;
          response = {
            field: e.instancePath,
            message: e.message
          }
          return response;
        }) };
      return;
    }
    return await next();
  };
};

module.exports = {
  validateBodyWithSchema: validateBodyWithSchema
};
