const { validateBodyWithSchema } = require("./base");

const validateRunProcess = validateBodyWithSchema(
  {
    type: "object"
  });

module.exports = {
  runProcess: validateRunProcess,
};
