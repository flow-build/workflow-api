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
exports.setDbConnection = setDbConnection;
exports.fetchWorkflowByName = fetchWorkflowByName;
exports.fetchWorkflowProcessesByWorkflowName = fetchWorkflowProcessesByWorkflowName;
exports.fetchWorkflowProcessesByWorkflowId = fetchWorkflowProcessesByWorkflowId;
exports.fetchProcessExecution = fetchProcessExecution;
exports.fetchStatesByNodeId = fetchStatesByNodeId;
let db;
function setDbConnection(dbConnection) {
    db = dbConnection;
}
function fetchWorkflowByName(workflow_name) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield db("workflow").where("name", workflow_name).orderBy("created_at", "desc");
    });
}
function fetchWorkflowProcessesByWorkflowName(workflow_name_1) {
    return __awaiter(this, arguments, void 0, function* (workflow_name, status = null, limit = 20, offset = 0) {
        let query = db("process")
            .select("process.id", "process.created_at", "process.current_state_id", "process.current_status", "workflow.name", "workflow.version")
            .join("workflow", "workflow.id", "process.workflow_id")
            .where("workflow.name", workflow_name)
            .orderBy("process.created_at", "desc")
            .limit(limit)
            .offset(offset);
        if (status && typeof status === "object") {
            query = query.whereIn("process.current_status", status);
        }
        return yield query;
    });
}
function fetchWorkflowProcessesByWorkflowId(workflow_id_1) {
    return __awaiter(this, arguments, void 0, function* (workflow_id, status = null, limit = 20, offset = 0) {
        let query = db("process")
            .select("process.id", "process.created_at", "process.current_state_id", "process.current_status", "workflow.name", "workflow.version")
            .join("workflow", "workflow.id", "process.workflow_id")
            .where("workflow.id", workflow_id)
            .orderBy("process.created_at", "desc")
            .limit(limit)
            .offset(offset);
        if (status && typeof status === "object") {
            query = query.whereIn("process.current_status", status);
        }
        return yield query;
    });
}
function fetchProcessExecution(process_id) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield db("process_state")
            .select("id", "step_number", "node_id", "next_node_id", "status")
            .where("process_id", process_id)
            .orderBy("step_number", "desc");
    });
}
function fetchStatesByNodeId(workflow_name, node_id) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield db("process_state")
            .select("workflow.name as workflow_name", "workflow.version", "workflow.id as workflow_id", "process_state.id as state_id", "process_state.step_number", "process_state.next_node_id", "process_state.result", "process_state.status", "process_state.created_at")
            .join("process", "process.id", "process_state.process_id")
            .join("workflow", "workflow.id", "process.workflow_id")
            .where("process_state.node_id", node_id)
            .where("workflow.name", workflow_name)
            .orderBy("created_at", "desc");
    });
}
