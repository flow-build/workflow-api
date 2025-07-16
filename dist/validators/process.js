"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRunProcess = validateRunProcess;
exports.validateFindProcesses = validateFindProcesses;
const listProcessFilters_1 = require("./schemas/listProcessFilters");
const base_1 = require("./base");
const runProcessSchema = {
    type: "object",
    properties: {},
    required: []
};
function validateRunProcess() {
    return (0, base_1.validateBodyWithSchema)(runProcessSchema);
}
function validateFindProcesses() {
    return (0, base_1.validateBodyWithSchema)(listProcessFilters_1.processListSchema);
}
