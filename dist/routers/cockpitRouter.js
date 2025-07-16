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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cam = __importStar(require("../controllers/cockpit/activityManager"));
const ev = __importStar(require("../controllers/cockpit/environmentVariable"));
const nodes_1 = require("../controllers/cockpit/nodes");
const cp = __importStar(require("../controllers/cockpit/process"));
const pt = __importStar(require("../controllers/cockpit/processTree"));
const cockpitController = __importStar(require("../controllers/cockpit/workflow"));
const connectionCtrl = __importStar(require("../controllers/connection"));
const workflowCtrl = __importStar(require("../controllers/workflow"));
const actordata_1 = require("../middlewares/actordata");
const base_1 = require("../validators/base");
const cockpitValidator = __importStar(require("../validators/cockpit"));
const wv = __importStar(require("../validators/workflow"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importStar(require("express"));
const router = (0, express_1.Router)();
router.use(express_1.default.json());
router.use(actordata_1.captureActorData);
router.use((0, cors_1.default)());
const connection = (0, express_1.Router)();
connection.post("/beacon", connectionCtrl.sendBeacon);
router.use("/connection", connection);
const workflows = (0, express_1.Router)();
workflows.get("/stats", cockpitController.fetchWorkflowsWithProcessStatusCount);
workflows.get("/:id/processes", base_1.validateUUID, cp.getProcessesByWorkflowId);
workflows.get("/name/:name/processes", cp.getProcessesByWorkflowName);
workflows.get("/name/:name/states/:node_id", cp.getStatesFromNode);
workflows.get("/variables", workflowCtrl.listWorkflowsEnviromentVariables);
workflows.post("/validate", wv.validateSaveWorkflow, workflowCtrl.validateBlueprint);
workflows.post("/compare", wv.validateSaveWorkflow, workflowCtrl.compareBlueprint);
router.use("/workflows", workflows);
const processes = (0, express_1.Router)();
processes.get("/:id/execution", base_1.validateUUID, cp.getProcessStateExecutionHistory);
processes.post("/:id/state", base_1.validateUUID, cockpitValidator.validateSetProcessState, cp.setProcessState);
processes.post("/:id/state/run", base_1.validateUUID, cp.runPendingProcess);
processes.post("/:id/set/:state_id", base_1.validateUUID, cp.transferProcessState);
processes.get("/:id/tree", base_1.validateUUID, pt.getProcessTree);
processes.post("/:id/expire", base_1.validateUUID, cp.expireProcess);
router.use("/processes", processes);
const nodes = (0, express_1.Router)();
nodes.get("/", nodes_1.getNodes);
nodes.post("/", cockpitValidator.validateFetchNodeSchema, nodes_1.fetchNode);
router.use("/nodes", nodes);
const activityManager = (0, express_1.Router)();
activityManager.post("/:id/expire", base_1.validateUUID, cam.expire);
router.use("/activities", activityManager);
const envs = (0, express_1.Router)();
envs.get("/", ev.getEnvironmentVariables);
envs.get("/:key", ev.getEnvironmentVariable);
envs.post("/", cockpitValidator.validateEnvironmentSchema, ev.saveEnvironmentVariable);
envs.delete("/:key", ev.deleteEnvironmentVariable);
router.use("/envs", envs);
exports.default = router;
