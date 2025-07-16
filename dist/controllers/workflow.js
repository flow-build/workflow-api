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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveWorkflow = saveWorkflow;
exports.getWorkflowsForActor = getWorkflowsForActor;
exports.listWorkflowsEnviromentVariables = listWorkflowsEnviromentVariables;
exports.fetchWorkflow = fetchWorkflow;
exports.fetchWorkflowByName = fetchWorkflowByName;
exports.deleteWorkflow = deleteWorkflow;
exports.fetchWorkflowProcessList = fetchWorkflowProcessList;
exports.createProcess = createProcess;
exports.createProcessByName = createProcessByName;
exports.createAndRunProcessByName = createAndRunProcessByName;
exports.validateBlueprint = validateBlueprint;
exports.compareBlueprint = compareBlueprint;
const engine_1 = require("../engine");
const compareBlueprints_1 = require("../services/compareBlueprints");
const logger_1 = require("../utils/logger");
const publishWorkflow_1 = require("../utils/publishWorkflow");
const workflow_1 = require("../validators/workflow");
require("../types/express");
const lodash_1 = require("lodash");
function serializeWorkflow(workflow) {
    return {
        id: workflow.workflow_id,
        name: workflow.name,
        description: workflow.description,
        version: workflow._version !== undefined ? workflow._version : workflow.version,
        hash: workflow._blueprint_hash,
        blueprint: workflow.blueprint_spec,
        isLatest: workflow._latest
    };
}
;
function serializeWorkflowNoBlueprint(workflow) {
    const _a = serializeWorkflow(workflow), { blueprint } = _a, rest = __rest(_a, ["blueprint"]);
    return rest;
}
function saveWorkflow(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("[controllers workflow] called saveWorkflow");
        const engine = (0, engine_1.getEngine)();
        const { workflow_id, name, description, blueprint_spec } = req.body;
        try {
            yield engine.validateBlueprint(blueprint_spec);
        }
        catch (err) {
            let message = "Unknown error";
            if (err instanceof Error) {
                message = `Failed at ${err.message}`;
            }
            res.status(409).send({
                error: "Invalid blueprint",
                message
            });
            return;
        }
        try {
            const response = yield engine.saveWorkflow(name, description, blueprint_spec, workflow_id);
            const warnings = {};
            warnings.environment = yield (0, workflow_1.validateEnvironmentVariable)(blueprint_spec);
            warnings.nodes = (0, workflow_1.validateNodesExtract)(blueprint_spec);
            logger_1.logger.debug("Workflow Created");
            if (!response.error) {
                const workflow = yield engine.fetchWorkflow(response.id);
                (0, publishWorkflow_1.publishWorkflow)(workflow);
                res.status(201).send({
                    workflow_id: workflow.id,
                    workflow_name: workflow.name,
                    hash: workflow._blueprint_hash,
                    version: workflow._version,
                    warnings: warnings
                });
            }
            else {
                res.status(409).send({
                    message: `Failed at ${response.error.errorType}`,
                    error: response.error.message
                });
            }
        }
        catch (err) {
            let message = "Unknown error";
            if (err instanceof Error)
                message = `Failed at ${err.message}`;
            res.status(500).send({ message: `Failed at ${message}`, error: err });
        }
    });
}
;
function getWorkflowsForActor(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("[controllers workflow] called getWorkflowsForActor");
        const cockpit = (0, engine_1.getCockpit)();
        const workflows = yield cockpit.getWorkflowsForActor(req.actorData);
        const body = (0, lodash_1.map)(workflows, (workflow) => {
            return serializeWorkflowNoBlueprint(workflow);
        });
        res.status(200).send(body);
    });
}
;
function listWorkflowsEnviromentVariables(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("[controllers workflow] called listWorkflowsEnviromentVariables");
        const cockpit = (0, engine_1.getCockpit)();
        const workflows = yield cockpit.getWorkflows();
        const body = workflows
            .filter((i) => (0, lodash_1.size)(i.blueprint_spec.environment) > 0)
            .reduce((result, item) => {
            const envs = (0, lodash_1.keys)(item.blueprint_spec.environment);
            envs.map((env) => {
                if (!result[env]) {
                    result[env] = [];
                }
                result[env].push(`${item.name} - v${item.version}`);
            });
            return result;
        }, {});
        res.status(200).send(body);
    });
}
;
function fetchWorkflow(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("[controllers workflow] called fetchWorkflow");
        const engine = (0, engine_1.getEngine)();
        const workflowId = req.params.id;
        const result = yield engine.fetchWorkflow(workflowId);
        if (result) {
            res.status(200).send(serializeWorkflow(result));
        }
        else {
            res.status(204);
        }
    });
}
;
function fetchWorkflowByName(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("[controllers workflow] called fetchWorkflowByName");
        const engine = (0, engine_1.getEngine)();
        const workflowName = req.params.name;
        const result = yield engine.fetchWorkflowByName(workflowName);
        if (result === null || result === void 0 ? void 0 : result._id) {
            res.status(200).send(serializeWorkflow(result));
        }
        else {
            res.status(204);
        }
    });
}
;
function deleteWorkflow(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("[controllers workflow] called deleteWorkflow");
        const engine = (0, engine_1.getEngine)();
        const cockpit = (0, engine_1.getCockpit)();
        const workflowId = req.params.id;
        const workflow = yield engine.fetchWorkflow(workflowId);
        if (!workflow) {
            res.status(409).send({ message: "No such workflow" });
            return;
        }
        const filters = { workflow_id: workflowId };
        const processes = yield cockpit.fetchProcessList(filters);
        if (processes.length > 0) {
            res.status(422).send({ message: "Cannot delete workflows with processes" });
            return;
        }
        const numDeleted = yield engine.deleteWorkflow(workflowId);
        if (numDeleted == 0) {
            res.status(409);
        }
        else {
            res.status(204);
        }
    });
}
;
function fetchWorkflowProcessList(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("[controllers workflow] called fetchWorkflowProcessList");
        const cockpit = (0, engine_1.getCockpit)();
        const workflowId = req.params.id;
        const filters = { workflow_id: workflowId };
        const processes = yield cockpit.fetchProcessList(filters);
        const body = (0, lodash_1.map)(processes, (process) => {
            const result = process.serialize();
            return {
                id: result.id,
                created_at: result.created_at,
                workflow_id: result.workflow_id,
                status: result.current_status,
                state: {
                    id: result.state.id,
                    step_number: result.state.step_number,
                    node_id: result.state.node_id,
                    next_node_id: result.state.next_node_id,
                    node_name: result.blueprint_spec.nodes.find((i) => i.id === result.state.node_id).name
                }
            };
        });
        res.status(200).send(body);
    });
}
;
function createProcess(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("[controllers workflow] called createProcess");
        const engine = (0, engine_1.getEngine)();
        const workflowId = req.params.id;
        const actorData = req.actorData;
        const input = req.body;
        const workflow = yield engine.fetchWorkflow(workflowId);
        if (workflow) {
            const process = yield engine.createProcess(workflowId, actorData, input);
            if (process) {
                res.status(201).send({
                    process_id: process.id,
                    workflow: {
                        id: workflow.id,
                        name: workflow.name,
                        version: workflow._version
                    }
                });
            }
            else {
                res.status(422).send({ message: `Failed while creating process` });
            }
        }
        else {
            res.status(409).send({ message: `No such workflow` });
        }
    });
}
;
function createProcessByName(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("[controllers workflow] called createProcessByName");
        const engine = (0, engine_1.getEngine)();
        const workflowName = req.params.name;
        const actorData = req.actorData;
        const input = req.body;
        const workflow = yield engine.fetchWorkflowByName(workflowName);
        if (workflow === null || workflow === void 0 ? void 0 : workflow._id) {
            const process = yield engine.createProcessByWorkflowName(workflowName, actorData, input);
            if (process) {
                res.status(201).send({
                    process_id: process.id,
                    workflow: {
                        id: workflow.id,
                        name: workflow.name,
                        version: workflow._version
                    }
                });
            }
            else {
                res.status(422).send({ message: `Failed while creating process` });
            }
        }
        else {
            res.status(409).send({ message: `No such workflow` });
        }
    });
}
function createAndRunProcessByName(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("[controllers workflow] called createAndRunProcessByName");
        const engine = (0, engine_1.getEngine)();
        const workflowName = req.params.workflowName;
        const actorData = req.actorData;
        const input = req.body;
        const workflow = yield yield engine.fetchWorkflowByName(workflowName);
        if (workflow === null || workflow === void 0 ? void 0 : workflow._id) {
            const process = yield engine.createProcessByWorkflowName(workflowName, actorData, input);
            if (process && process.id) {
                engine.runProcess(process.id, actorData);
                res.status(201).send({
                    process_id: process.id,
                    workflow: {
                        id: workflow.id,
                        name: workflow.name,
                        version: workflow._version
                    }
                });
            }
            else {
                res.status(422).send({ message: `Failed while creating process` });
            }
        }
        else {
            res.status(409).send({ message: `No such workflow` });
        }
    });
}
;
function validateBlueprint(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("[controllers workflow] called validateBlueprint");
        const engine = (0, engine_1.getEngine)();
        const { blueprint_spec } = req.body;
        try {
            yield engine.validateBlueprint(blueprint_spec);
            res.status(200).send({ message: "Blueprint is valid" });
        }
        catch (err) {
            res.status(422).send({
                error: "Invalid blueprint",
                message: `Failed at ${err.message}`
            });
        }
    });
}
;
function compareBlueprint(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("[controllers workflow] called compareBlueprint");
        const { name, blueprint_spec } = req.body;
        try {
            const compare = yield (0, compareBlueprints_1.compareBlueprints)(name, blueprint_spec);
            if (compare.error) {
                res.status(422).send({
                    error: "Invalid blueprint",
                    message: `Failed at ${compare.error}`
                });
            }
            else if (compare.changes) {
                if (compare.currentWorkflow) {
                    res.status(202).send({
                        status: "Changes found, check comparison",
                        currentWorkflow: compare.currentWorkflow,
                        comparison: compare.comparison
                    });
                }
                else {
                    res.status(409).send({ status: "No workflow with this name" });
                }
            }
            else {
                res.status(200).send({
                    status: "No changes found",
                    currentWorkflow: compare.currentWorkflow
                });
            }
        }
        catch (err) {
            logger_1.logger.error(err);
            res.status(422).send({
                error: err
            });
        }
    });
}
;
