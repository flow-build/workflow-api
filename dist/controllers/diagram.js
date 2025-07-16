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
exports.buildDiagram = buildDiagram;
exports.buildBlueprint = buildBlueprint;
const engine_1 = require("../engine");
const logger_1 = require("../utils/logger");
require("../types/express");
const nodejs_diagram_builder_1 = require("@flowbuild/nodejs-diagram-builder");
const raw_body_1 = __importDefault(require("raw-body"));
const uuid_1 = require("uuid");
function buildDiagram(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("Called buildDiagram");
        const engine = (0, engine_1.getEngine)();
        const blueprint = req.body;
        const workflowId = blueprint === null || blueprint === void 0 ? void 0 : blueprint.workflow_id;
        let diagram;
        if (workflowId) {
            const is_valid = (0, uuid_1.validate)(workflowId);
            if (!is_valid) {
                res.status(400).json({ message: "Invalid uuid" });
                return;
            }
            const workflow = yield engine.fetchWorkflow(workflowId);
            if (!workflow) {
                res.status(404).json({ message: "No such workflow" });
                return;
            }
            blueprint.name = workflow._name;
            blueprint.description = workflow._description;
            blueprint.blueprint_spec = workflow._blueprint_spec;
        }
        try {
            diagram = yield (0, nodejs_diagram_builder_1.buildXmlDiagram)(blueprint);
            res.status(200).send(diagram);
        }
        catch (err) {
            res.status(400).json({ message: `Failed at ${err.message}`, error: err });
        }
        return next();
    });
}
function buildBlueprint(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("Called buildBlueprint");
        const diagram = yield (0, raw_body_1.default)(req);
        try {
            const result = yield (0, nodejs_diagram_builder_1.buildBlueprintFromBpmn)(diagram);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(400).json({ message: `Failed at ${err.message}`, error: err });
        }
        return next();
    });
}
