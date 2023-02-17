const { validateBodyWithSchema, validateQueryWithSchema } = require("./base");
const listProcessFilters = require("./schemas/listProcessFilters");

const validateFindProcesses = validateBodyWithSchema(listProcessFilters)

const validateRunProcess = validateBodyWithSchema(
  {
    type: "object"
  });

const validateListProcesses = validateQueryWithSchema(
  {
    type: "object"
  });

module.exports = {
  runProcess: validateRunProcess,
  findProcesses: validateFindProcesses,
  listProcesses: validateListProcesses
};
