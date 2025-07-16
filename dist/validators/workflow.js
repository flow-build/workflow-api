"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSaveWorkflow = validateSaveWorkflow;
exports.validateCreateProcess = validateCreateProcess;
exports.validateNodes = validateNodes;
exports.validateConnections = validateConnections;
exports.validateEnvironmentVariable = validateEnvironmentVariable;
exports.validateNodesExtract = validateNodesExtract;
const engine_1 = require("../engine");
const logger_1 = require("../utils/logger");
const nodes_1 = require("./schemas/nodes");
const workflow_1 = require("./schemas/workflow");
const base_1 = require("./base");
require("../types/express");
function isUnique(array) {
    const uniqueArray = [...new Set(array)];
    return array.length === uniqueArray.length;
}
;
function validateSaveWorkflow() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, base_1.validateBodyWithSchema)(workflow_1.workflowSchema);
    });
}
function validateCreateProcess() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, base_1.validateBodyWithSchema)({ type: "object" });
    });
}
function validateNodes(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.debug("[validators workflow] called validateNodes");
        const blueprintSpec = req.body.blueprint_spec;
        const validateNode = blueprintSpec.nodes.map((node) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const nodeType = node.type.toLowerCase();
            let parametersValidation;
            let typeValidation;
            let nodeCategory;
            if (nodeType === "systemtask") {
                nodeCategory = ((_a = node.category) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "";
            }
            if (nodes_1.nodeSchema[nodeType]) {
                logger_1.logger.silly("validate type");
                typeValidation = yield (0, base_1.validateDataWithSchema)(nodes_1.nodeSchema[nodeType], node);
            }
            else {
                logger_1.logger.info(`bypassing type validation, no schema defined for type [${nodeType}]`);
                typeValidation = { isValid: true, errors: [] };
            }
            if (nodeCategory) {
                logger_1.logger.silly("validate category");
                if (nodes_1.categorySchema[nodeCategory]) {
                    parametersValidation = yield (0, base_1.validateDataWithSchema)(nodes_1.categorySchema[nodeCategory], node.parameters);
                }
                else {
                    logger_1.logger.info(`bypassing parameters validation, no schema defined for category [${nodeCategory}]`);
                    parametersValidation = { isValid: true, errors: [] };
                }
            }
            else {
                parametersValidation = { isValid: true, errors: [] };
            }
            return {
                data: node,
                isValid: typeValidation.isValid && parametersValidation.isValid,
                errors: [...((typeValidation === null || typeValidation === void 0 ? void 0 : typeValidation.errors) || []), ...((parametersValidation === null || parametersValidation === void 0 ? void 0 : parametersValidation.errors) || [])]
            };
        }));
        const nodesResult = yield Promise.all(validateNode);
        const errors = nodesResult.reduce((acc, item) => {
            if (item.isValid) {
                return acc;
            }
            else {
                return ++acc;
            }
        }, 0);
        if (errors > 0) {
            res.status(400).send({
                message: "Invalid Node",
                error: nodesResult
                    .filter(item => !item.isValid)
                    .map((result) => {
                    return {
                        node: result.data.id,
                        type: result.data.type,
                        category: result.data.category,
                        errors: result.errors.map((error) => {
                            return {
                                field: error.instancePath,
                                message: error.message
                            };
                        })
                    };
                })
            });
            return;
        }
        else {
            return next();
        }
    });
}
;
function validateConnections(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.debug("called validateConnections");
        const blueprintSpec = req.body.blueprint_spec;
        const lanes = blueprintSpec.lanes.map((lane) => {
            return lane.id;
        });
        const nodes = blueprintSpec.nodes.map((node) => {
            return node.id;
        });
        const nodeConnections = blueprintSpec.nodes.map((node) => __awaiter(this, void 0, void 0, function* () {
            if (node.type.toLowerCase() === "flow") {
                if (!node.next)
                    throw new Error("No next");
                const next = Object.values(node.next);
                return {
                    id: node.id,
                    name: node.name,
                    unique: nodes.filter((item) => item === node.id).length === 1,
                    lane: lanes.includes(node.lane_id),
                    next: next.reduce((acc, n) => {
                        if (!nodes.includes(n)) {
                            return false;
                        }
                        return acc;
                    }, true)
                };
            }
            else {
                return {
                    id: node.id,
                    name: node.name,
                    unique: nodes.filter(item => item === node.id).length === 1,
                    lane: lanes.includes(node.lane_id),
                    next: node.next ? nodes.includes(node.next.toString()) : true
                };
            }
        }));
        const nodesResult = yield Promise.all(nodeConnections);
        let errors = yield nodesResult.reduce((acc, item) => {
            if (!item.lane || !item.next || !item.unique) {
                return ++acc;
            }
            else {
                return acc;
            }
        }, 0);
        const errorMessage = [];
        if (!isUnique(lanes)) {
            errors++;
            errorMessage.push({
                lanes: "There is a duplicated lane id"
            });
        }
        if (errors > 0) {
            res.status(400).send({
                message: "Invalid Connections",
                error: [...errorMessage, ...nodesResult.filter(item => !item.lane || !item.next || !item.unique)]
            });
            return;
        }
        return next();
    });
}
;
function validateEnvironmentVariable(spec) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        const validateInfo = [];
        const cockpit = (0, engine_1.getCockpit)();
        const nodesString = JSON.stringify(spec.nodes);
        try {
            for (var _d = true, _e = __asyncValues(Object.entries(spec.environment)), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                _c = _f.value;
                _d = false;
                const [key, value] = _c;
                const variable = yield cockpit.fetchEnvironmentVariable(value);
                if (!variable) {
                    const error_message = `Variable ${key} not found at the environment`;
                    validateInfo.push(error_message);
                }
                if (!nodesString.includes(`environment.${key}`)) {
                    const error_message = `Variable ${key} not declared in any node`;
                    validateInfo.push(error_message);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return validateInfo;
    });
}
function validateNodesExtract(spec) {
    var _a, _b;
    const validateInfo = [];
    for (const node of spec.nodes) {
        if ((node === null || node === void 0 ? void 0 : node.extract) !== ((_a = node === null || node === void 0 ? void 0 : node.extract) === null || _a === void 0 ? void 0 : _a.toLowerCase())) {
            const warning_message = `Node ${node.id}: extract will be saved in lower case - ${(_b = node === null || node === void 0 ? void 0 : node.extract) === null || _b === void 0 ? void 0 : _b.toLowerCase()}`;
            validateInfo.push(warning_message);
        }
    }
    return validateInfo;
}
