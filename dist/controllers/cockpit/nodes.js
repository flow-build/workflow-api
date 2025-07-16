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
exports.getNodes = getNodes;
exports.fetchNode = fetchNode;
const engine_1 = require("../../engine");
require("../../types/express");
const engine_2 = require("@flowbuild/engine");
function getNodes(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const types = engine_2.NodeUtils.getNodeTypes();
        const categories = engine_2.NodeUtils.getNodeCategories();
        const cockpit = (0, engine_1.getCockpit)();
        const actor_data = (_a = req.state) === null || _a === void 0 ? void 0 : _a.actor_data;
        const workflows = yield cockpit.getWorkflowsForActor(actor_data);
        const nodes = workflows.flatMap((w) => w.blueprint_spec.nodes);
        const typeKeys = Object.keys(types);
        const categoryKeys = Object.keys(categories);
        res.status(200).json({
            types: typeKeys.map(type => ({
                type: type,
                nodes: nodes.filter((node) => node.type.toLowerCase() === type).length
            })),
            categories: categoryKeys.map(category => ({
                category: category,
                nodes: nodes.filter((node) => { var _a; return ((_a = node.category) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === category; }).length
            }))
        });
        return next();
    });
}
function fetchNode(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = req.body;
        if (body.type.toLowerCase() === "systemtask" && !body.category) {
            res.status(400).json({
                message: "Invalid Request Body",
                error: [{ message: "systemTasks must have required property category" }]
            });
            return next();
        }
        try {
            const node = (0, engine_2.getNode)(body);
            res.status(200).json({ schema: node.constructor.schema });
            return next();
        }
        catch (e) {
            console.log(e);
            res.status(404).json({ message: e.toString() });
            return next();
        }
    });
}
