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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWorkflowsWithProcessStatusCount = fetchWorkflowsWithProcessStatusCount;
exports.setProcessState = setProcessState;
exports.runPendingProcess = runPendingProcess;
const engine_1 = require("../engine");
const logger_1 = require("../utils/logger");
require("../types/express");
function fetchWorkflowsWithProcessStatusCount(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("[KW] Called fetchWorkflowsWithProcessStatusCount");
        const cockpit = (0, engine_1.getCockpit)();
        const filters = req.query;
        const workflows = yield cockpit.fetchWorkflowsWithProcessStatusCount(filters);
        res.status(200).json({ workflows });
        return next();
    });
}
function setProcessState(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("[KW] Called setProcessState");
        const cockpit = (0, engine_1.getCockpit)();
        const process_id = req.params.id;
        const state_data = req.body;
        const result = yield cockpit.setProcessState(process_id, state_data);
        res.status(200).json(result.serialize());
        return next();
    });
}
function runPendingProcess(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("[KW] Called runPendingProcess");
        const cockpit = (0, engine_1.getCockpit)();
        const process_id = req.params.id;
        const actor_data = req.body;
        yield cockpit.runPendingProcess(process_id, actor_data);
        res.status(202).send();
        return next();
    });
}
