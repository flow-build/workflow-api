const { validateBodyWithSchema } = require("./base.validator");

const validateRunProcess = validateBodyWithSchema(
  {
    type: "object"
  });

module.exports = {
  runProcess: validateRunProcess,
};
