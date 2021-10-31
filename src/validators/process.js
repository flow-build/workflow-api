const { validateBodyWithSchema } = require("./base");
const listProcessFilters = require("./schemas/listProcessFilters");

const validateFindProcesses = validateBodyWithSchema(listProcessFilters)

const validateRunProcess = validateBodyWithSchema(
  {
    type: "object"
  });

module.exports = {
  runProcess: validateRunProcess,
  findProcesses: validateFindProcesses
};
