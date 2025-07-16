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
exports.fetchById = fetchById;
exports.fetchStateExecution = fetchStateExecution;
exports.fetchMultipleStateExecution = fetchMultipleStateExecution;
exports.fetchStateByParameters = fetchStateByParameters;
exports.fetchSpec = fetchSpec;
exports.calculateExecutionData = calculateExecutionData;
const engine_1 = require("../engine");
const logger_1 = require("../utils/logger");
require("../types/express");
const engine_2 = require("@flowbuild/engine");
const lodash_1 = __importDefault(require("lodash"));
function getStateById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const cockpit = (0, engine_1.getCockpit)();
        return yield cockpit.getProcessState(id);
    });
}
function getStateByStepNumber(processId, stepNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const cockpit = (0, engine_1.getCockpit)();
        return yield cockpit.findProcessStatesByStepNumber(processId, stepNumber);
    });
}
function getStateByNodeId(processId, nodeId) {
    return __awaiter(this, void 0, void 0, function* () {
        const cockpit = (0, engine_1.getCockpit)();
        return yield cockpit.findProcessStatesByNodeId(processId, nodeId);
    });
}
function getProcessById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const cockpit = (0, engine_1.getCockpit)();
        return yield cockpit.fetchProcess(id);
    });
}
function getStateExecutionContext(state_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const cockpit = (0, engine_1.getCockpit)();
        return yield cockpit.fetchStateExecutionContext(state_id);
    });
}
function serializeState(state) {
    return {
        id: state._id,
        created_at: state._created_at,
        process_id: state._process_id,
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
function stateNotFound(res) {
    res.status(404).json({ message: "stateId not found" });
}
function buildExecutionResponse(spec, node, input) {
    const keys = Object.keys(spec.parameters);
    const executionData = {};
    const parameters = keys.reduce((executionData, key) => {
        return Object.assign(Object.assign({}, executionData), { [key]: node[key] || node._spec.parameters[key] });
    }, executionData);
    return Object.assign(Object.assign({}, parameters), { input });
}
function buildStateResponse(states, process) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        let response = {};
        if (!lodash_1.default.isArray(states)) {
            response = Object.assign(Object.assign({}, serializeState(states)), {
                environment: (_a = process === null || process === void 0 ? void 0 : process._blueprint_spec) === null || _a === void 0 ? void 0 : _a.environment,
                parameters: (_b = process === null || process === void 0 ? void 0 : process._blueprint_spec) === null || _b === void 0 ? void 0 : _b.parameters
            });
            return response;
        }
        if (states && states.length > 0) {
            response = {
                environment: (_c = process === null || process === void 0 ? void 0 : process._blueprint_spec) === null || _c === void 0 ? void 0 : _c.environment,
                parameters: (_d = process === null || process === void 0 ? void 0 : process._blueprint_spec) === null || _d === void 0 ? void 0 : _d.parameters,
                states: lodash_1.default.map(states, (state) => serializeState(state))
            };
        }
        else {
            response = {
                message: "no state found with the parameter provided"
            };
        }
        return response;
    });
}
function fetchById(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("called fetchStateByParameters");
        const stateId = req.params.id;
        const state = yield getStateById(stateId);
        if (!state) {
            stateNotFound(res);
            return next();
        }
        const processId = state._process_id;
        const process = yield getProcessById(processId);
        const response = yield buildStateResponse(state, process);
        res.status(200).json(response);
        return next();
    });
}
function fetchStateExecution(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("called fetchStateExecution");
        const stateId = req.params.id;
        const response = yield getStateExecutionContext(stateId);
        res.status(200).json(response);
        return next();
    });
}
function fetchMultipleStateExecution(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("called fetchMultipleStateExecution");
        const processId = req.params.process_id;
        const nodeId = req.params.node_id;
        const states = yield getStateByNodeId(processId, nodeId);
        if (!states) {
            res.status(404).json({ message: "no states found for given process_id and node_id" });
            return next();
        }
        const response = yield Promise.all(states.map((state) => getStateExecutionContext(state._id)));
        res.status(200).json(response);
        return next();
    });
}
function fetchStateByParameters(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("called fetchStateByParameters");
        const processId = req.params.id;
        const nodeId = req.query.nodeId;
        const stepNumber = req.query.stepNumber ? parseInt(req.query.stepNumber) : undefined;
        if (!nodeId && !stepNumber) {
            res.status(400).json({ message: "you should define at least one param (nodeId or stepNumber)" });
            return next();
        }
        const process = yield getProcessById(processId);
        if (!process) {
            res.status(404).json({ message: "process not found" });
            return next();
        }
        let states = null;
        if (stepNumber) {
            states = yield getStateByStepNumber(processId, stepNumber);
        }
        else if (nodeId) {
            states = yield getStateByNodeId(processId, nodeId);
        }
        if (!states) {
            res.status(404).json({
                message: "no state found with the parameter provided",
                params: { nodeId, stepNumber }
            });
            return next();
        }
        const response = yield buildStateResponse(states, process);
        res.status(200).json(response);
        return next();
    });
}
function fetchSpec(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        logger_1.logger.verbose("called calculateExecutionData");
        const stateId = req.params.id;
        const state = yield getStateById(stateId);
        if (!state) {
            stateNotFound(res);
            return next();
        }
        const process = yield getProcessById(state._process_id);
        const nodeSpec = (_a = process === null || process === void 0 ? void 0 : process._blueprint_spec) === null || _a === void 0 ? void 0 : _a.nodes.find((node) => node.id === state._node_id);
        if (!nodeSpec) {
            res.status(404).json({ message: "node spec not found" });
            return next();
        }
        const node = yield (0, engine_2.getNode)(nodeSpec);
        res.status(200).json(node._spec);
        return next();
    });
}
function calculateExecutionData(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        logger_1.logger.verbose("called calculateExecutionData");
        const stateId = req.params.id;
        const state = yield getStateById(stateId);
        if (!state) {
            stateNotFound(res);
            return next();
        }
        const process = yield getProcessById(state._process_id);
        const previousState = yield getStateByStepNumber(state._process_id, state._step_number);
        const nodeSpec = (_a = process === null || process === void 0 ? void 0 : process._blueprint_spec) === null || _a === void 0 ? void 0 : _a.nodes.find((node) => node.id === state._node_id);
        if (!nodeSpec) {
            res.status(404).json({ message: "node spec not found" });
            return next();
        }
        const node = yield (0, engine_2.getNode)(nodeSpec);
        const response = yield node._preProcessing({
            bag: previousState === null || previousState === void 0 ? void 0 : previousState._bag,
            input: previousState === null || previousState === void 0 ? void 0 : previousState._result,
            actor_data: previousState === null || previousState === void 0 ? void 0 : previousState._actor_data,
            environment: (_b = process === null || process === void 0 ? void 0 : process._blueprint_spec) === null || _b === void 0 ? void 0 : _b.environment,
            parameters: (_c = process === null || process === void 0 ? void 0 : process._blueprint_spec) === null || _c === void 0 ? void 0 : _c.parameters
        });
        res.status(200).json(buildExecutionResponse(nodeSpec, node, response));
        return next();
    });
}
