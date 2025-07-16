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
exports.getProcessTree = getProcessTree;
const engine_1 = require("../../engine");
const db_1 = require("../../utils/db");
const logger_1 = require("../../utils/logger");
require("../../types/express");
const process_tree_1 = require("@flowbuild/process-tree");
const tree = new process_tree_1.Tree(db_1.db);
function getProcessTree(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("called getProcessTree");
        const process_id = req.params.id;
        const myTree = yield tree.getPath(process_id);
        const cockpit = (0, engine_1.getCockpit)();
        const promises = myTree.map((p) => __awaiter(this, void 0, void 0, function* () {
            const process = yield cockpit.fetchProcess(p.processId);
            return {
                process_id: p.processId,
                parent_id: p.parentId,
                depth: p.depth,
                workflow_name: process.workflow_name,
                current_status: process._current_status
            };
        }));
        const processes = yield Promise.all(promises);
        if (myTree) {
            res.status(200).json(processes);
        }
        else {
            res.status(404).json({ message: "Not found" });
        }
        return next();
    });
}
