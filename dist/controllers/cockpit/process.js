"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.setProcessState = setProcessState;
exports.transferProcessState = transferProcessState;
exports.runPendingProcess = runPendingProcess;
exports.getProcessesByWorkflowId = getProcessesByWorkflowId;
exports.getProcessesByWorkflowName = getProcessesByWorkflowName;
exports.getProcessStateExecutionHistory = getProcessStateExecutionHistory;
exports.getStatesFromNode = getStatesFromNode;
exports.expireProcess = expireProcess;
const engine_1 = require("../../engine");
const cockpitService = __importStar(require("../../services/cockpit"));
const logger_1 = require("../../utils/logger");
require("../../types/express");
function setState(process, state_data) {
    return __awaiter(this, void 0, void 0, function* () {
        const cockpit = (0, engine_1.getCockpit)();
        const process_id = process.id;
        const result = yield cockpit.setProcessState(process_id, state_data);
        return {
            workflow_name: process.workflow_name,
            process_id: process._id,
            state: {
                state_id: result.id,
                step_number: result.step_number,
                node_id: result.node_id,
                next_node_id: result.next_node_id,
                status: result.status,
                result: result.result,
                bag: result.bag,
                actor_data: "actor data will bet set by state run"
            },
            message: "to resume process execute a state run"
        };
    });
}
function setProcessState(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("Called setProcessState");
        const cockpit = (0, engine_1.getCockpit)();
        const process_id = req.params.id;
        const state_data = req.body;
        const process = yield cockpit.fetchProcess(process_id);
        if (process) {
            const next_node = process._blueprint_spec.nodes.find((n) => n.id === state_data.next_node_id);
            if (next_node) {
                const result = yield setState(process, state_data);
                res.status(200).json(result);
            }
            else {
                res.status(404).json({ message: "No such next_node" });
            }
        }
        else {
            res.status(404).json({ message: "No such process" });
        }
        return next();
    });
}
function transferProcessState(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("Called transferProcessState");
        const cockpit = (0, engine_1.getCockpit)();
        const process_id = req.params.id;
        const state_id = req.params.state_id;
        const process = yield cockpit.fetchProcess(process_id);
        if (process) {
            const state = yield cockpit.getProcessState(state_id);
            if (state) {
                const next_node = process._blueprint_spec.nodes.find((n) => n.id === state.next_node_id);
                if (next_node) {
                    const state_data = {
                        next_node_id: state.next_node_id,
                        bag: state.bag,
                        result: state.result
                    };
                    const result = yield setState(process, state_data);
                    res.status(200).json(result);
                }
                else {
                    res.status(400).json({ message: "State incompatible to process" });
                }
            }
            else {
                res.status(404).json({ message: "No such state" });
            }
        }
        else {
            res.status(404).json({ message: "No such process" });
        }
        return next();
    });
}
function runPendingProcess(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("Called runPendingProcess");
        const cockpit = (0, engine_1.getCockpit)();
        const process_id = req.params.id;
        const actor_data = req.body;
        const process = yield cockpit.fetchProcess(process_id);
        if (process) {
            if (process._current_status === "pending") {
                try {
                    yield cockpit.runPendingProcess(process_id, actor_data);
                    res.status(202).json({
                        message: "process resumed, get process to check its current state",
                        process_url: `${req.headers.host}/processes/${process_id}`
                    });
                }
                catch (e) {
                    res.status(400).json({ message: `Failed at ${e.message}`, error: e });
                }
            }
            else {
                res.status(422).json({ message: "Invalid process status" });
            }
        }
        else {
            res.status(404).json({ message: "No such process" });
        }
        return next();
    });
}
function getProcessesByWorkflowId(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("Cockpit getProcessesByWorkflowId");
        const workflow_id = req.params.id;
        const engine = (0, engine_1.getEngine)();
        const workflow = yield engine.fetchWorkflow(workflow_id);
        if (workflow) {
            try {
                const result = yield cockpitService.fetchWorkflowProcessesByWorkflowId(workflow_id);
                res.status(200).json(result.map((p) => ({
                    process_id: p.id,
                    created_at: p.created_at,
                    state_id: p.current_state_id,
                    status: p.current_status,
                    workflow_name: p.name,
                    workflow_version: p.version
                })));
            }
            catch (e) {
                res.status(400).json({ message: `Failed at ${e.message}`, error: e });
            }
        }
        else {
            res.status(404).json({ message: "No such workflow" });
        }
        return next();
    });
}
function getProcessesByWorkflowName(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("Cockpit getProcessesByWorkflowName");
        const workflow_name = req.params.name;
        const engine = (0, engine_1.getEngine)();
        const workflow = yield engine.fetchWorkflowByName(workflow_name);
        if (workflow === null || workflow === void 0 ? void 0 : workflow._id) {
            try {
                const result = yield cockpitService.fetchWorkflowProcessesByWorkflowName(workflow_name);
                res.status(200).json(result.map((p) => ({
                    process_id: p.id,
                    created_at: p.created_at,
                    state_id: p.current_state_id,
                    status: p.current_status,
                    workflow_name: p.name,
                    workflow_version: p.version
                })));
            }
            catch (e) {
                res.status(400).json({ message: `Failed at ${e.message}`, error: e });
            }
        }
        else {
            res.status(404).json({ message: "No such workflow" });
        }
        return next();
    });
}
function getProcessStateExecutionHistory(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("Cockpit getProcessStateExecutionHistory");
        const process_id = req.params.id;
        const qs = req.query;
        const filters = {
            fromStep: qs.fromStep || null
        };
        const cockpit = (0, engine_1.getCockpit)();
        try {
            const result = yield cockpit.getProcessStateExecutionHistory(process_id, filters);
            res.status(200).json(result);
        }
        catch (e) {
            res.status(400).json({ message: `Failed at ${e.message}`, error: e });
        }
        return next();
    });
}
function getStatesFromNode(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const workflow_name = req.params.name;
        const node_id = req.params.node_id;
        try {
            const result = yield cockpitService.fetchStatesByNodeId(workflow_name, node_id);
            res.status(200).json(result);
        }
        catch (e) {
            res.status(400).json({ message: `Failed at ${e.message}`, error: e });
        }
        return next();
    });
}
function expireProcess(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        logger_1.logger.verbose("Cockpit expireProcess");
        const process_id = req.params.id;
        const actor_data = (_a = req.state) === null || _a === void 0 ? void 0 : _a.actor_data;
        const result = req.body;
        const cockpit = (0, engine_1.getCockpit)();
        const process = yield cockpit.fetchProcess(process_id);
        if (!process) {
            res.status(404).json({ message: "Process not found" });
            return next();
        }
        try {
            yield cockpit.expireProcess(process_id, actor_data, result);
            res.status(200).json({ message: "Process expired" });
        }
        catch (e) {
            res.status(400).json({ message: `Failed at ${e.message}`, error: e });
        }
        return next();
    });
}
