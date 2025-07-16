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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchProcess = fetchProcess;
exports.listProcesses = listProcesses;
exports.fetchProcessList = fetchProcessList;
exports.fetchProcessStateHistory = fetchProcessStateHistory;
exports.runProcess = runProcess;
exports.abortProcess = abortProcess;
exports.fetchStateByParameters = fetchStateByParameters;
exports.continueProcess = continueProcess;
const engine_1 = require("../engine");
const logger_1 = require("../utils/logger");
require("../types/express");
const lodash_1 = __importDefault(require("lodash"));
const stoppedStatus = ["finished", "interrupted", "error"];
function serializeState(state) {
    return {
        id: state._id,
        created_at: state._created_at,
        step_number: state._step_number,
        node_id: state._node_id,
        next_node_id: state._next_node_id,
        bag: state._bag,
        external_input: state._external_input,
        result: state._result,
        error: state._error,
        status: state._status,
        actor_data: state._actor_data,
        engine_id: state._engine_id,
        time_elapsed: state._time_elapsed
    };
}
function serializeProcess(process) {
    const state = process.state;
    return {
        id: process.id,
        created_at: process._created_at,
        workflow: {
            id: process._workflow_id,
            name: process._workflow.name,
            version: process._workflow.version,
            isLatest: process._workflow.isLatest
        },
        state: state ? serializeState(state) : undefined
    };
}
function fetchProcess(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("called fetchProcess");
        const cockpit = (0, engine_1.getCockpit)();
        const processId = req.params.id;
        const process = yield cockpit.fetchProcess(processId);
        if (process) {
            res.status(200).json(serializeProcess(process));
        }
        else {
            res.status(204).send();
        }
        return next();
    });
}
function listProcesses(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("Called listProcesses");
        const filters = req.body;
        const cockpit = (0, engine_1.getCockpit)();
        const processes = yield cockpit.fetchProcessList(filters);
        res.status(200).json(lodash_1.default.map(processes, (process) => serializeProcess(process)));
        return next();
    });
}
function fetchProcessList(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("Called fetchProcessList");
        const cockpit = (0, engine_1.getCockpit)();
        const query_params = req.query;
        const workflowId = query_params.workflow_id;
        const filters = workflowId ? { workflow_id: workflowId } : {};
        const processes = yield cockpit.fetchProcessList(filters);
        res.status(200).json(lodash_1.default.map(processes, (process) => serializeProcess(process)));
        return next();
    });
}
function fetchProcessStateHistory(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("called fetchProcessStateHistory");
        const cockpit = (0, engine_1.getCockpit)();
        const processId = req.params.id;
        const qs = req.query;
        const filters = {
            fromStep: qs.fromStep || null
        };
        const states = yield cockpit.fetchProcessStateHistory(processId, filters);
        if (states) {
            if (states.length) {
                res.status(200).json(lodash_1.default.map(states, (state) => serializeState(state)));
                return next();
            }
            res.status(204).send();
        }
        else {
            res.status(204).send();
        }
        return next();
    });
}
function runProcess(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("called runProcess");
        const cockpit = (0, engine_1.getCockpit)();
        const processId = req.params.id;
        const actor_data = req.actorData;
        const input = req.body;
        const process = yield cockpit.fetchProcess(processId);
        if (process) {
            if (stoppedStatus.includes(process._current_status)) {
                res.status(422).json({ current_status: process._current_status });
            }
            else {
                const result = yield cockpit.runProcess(processId, actor_data, input);
                res.status(result ? 200 : 204).send();
            }
        }
        else {
            res.status(204).send();
        }
        return next();
    });
}
function abortProcess(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("Called abortProcess");
        const cockpit = (0, engine_1.getCockpit)();
        const processId = req.params.id;
        const actorData = req.actorData;
        const process = yield cockpit.fetchProcess(processId);
        if (process) {
            if (stoppedStatus.includes(process._current_status)) {
                res.status(422).json({ current_status: process._current_status });
            }
            else {
                const result = yield cockpit.abortProcess(processId, actorData);
                res.status(result ? 200 : 404).send();
            }
        }
        else {
            res.status(404).send();
        }
        return next();
    });
}
function fetchStateByParameters(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        logger_1.logger.verbose("called fetchStateByParameters");
        const cockpit = (0, engine_1.getCockpit)();
        const processId = req.params.id;
        const nodeId = req.query.nodeId;
        const stepNumber = req.query.stepNumber ? parseInt(req.query.stepNumber) : undefined;
        if (!nodeId && !stepNumber) {
            res.status(400).json({ message: "you should define at least one param (nodeId or stepNumber)" });
            return next();
        }
        const process = yield cockpit.fetchProcess(processId);
        const states = yield cockpit.fetchProcessStateHistory(processId);
        if (!states) {
            res.status(404).json({ message: "process not found" });
            return next();
        }
        let filteredStates = [];
        if (stepNumber) {
            filteredStates = states.filter((item) => item._step_number === stepNumber);
        }
        else if (nodeId) {
            filteredStates = states.filter((item) => item._node_id == nodeId);
        }
        if (filteredStates.length > 0) {
            res.status(200).json({
                environment: (_a = process === null || process === void 0 ? void 0 : process._blueprint_spec) === null || _a === void 0 ? void 0 : _a.environment,
                parameters: (_b = process === null || process === void 0 ? void 0 : process._blueprint_spec) === null || _b === void 0 ? void 0 : _b.parameters,
                states: lodash_1.default.map(filteredStates, (state) => serializeState(state))
            });
        }
        else {
            res.status(404).json({
                message: "no state found with the parameter provided",
                params: { nodeId, stepNumber }
            });
        }
        return next();
    });
}
function continueProcess(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("called continueProcess");
        const engine = (0, engine_1.getEngine)();
        const processId = req.params.id;
        const actorData = req.actorData;
        const input = req.body;
        const result = yield engine.continueProcess(processId, actorData, input);
        if (result === null || result === void 0 ? void 0 : result.error) {
            res.status(422).json(result.error);
            return next();
        }
        res.status(200).json({ message: "Process continue signaled" });
        return next();
    });
}
