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
const activityCtrl = __importStar(require("../controllers/activity"));
const diagramCtrl = __importStar(require("../controllers/diagram"));
const packageCtrl = __importStar(require("../controllers/package"));
const processCtrl = __importStar(require("../controllers/process"));
const statesCtrl = __importStar(require("../controllers/state"));
const workflowCtrl = __importStar(require("../controllers/workflow"));
const actordata_1 = require("../middlewares/actordata");
const trace_1 = require("../middlewares/trace");
const userAgent_1 = require("../middlewares/userAgent");
const baseValid = __importStar(require("../validators/base"));
const processValid = __importStar(require("../validators/process"));
const wfValidator = __importStar(require("../validators/workflow"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importStar(require("express"));
const router = (0, express_1.Router)();
router.use(express_1.default.json());
router.use(actordata_1.captureActorData);
router.use(trace_1.captureTraceData);
router.use(userAgent_1.captureUserAgentAndIp);
router.use((0, cors_1.default)());
const workflows = (0, express_1.Router)();
workflows.get("/", workflowCtrl.getWorkflowsForActor);
workflows.get("/:id", baseValid.validateUUID, workflowCtrl.fetchWorkflow);
workflows.get("/:id/processes", baseValid.validateUUID, workflowCtrl.fetchWorkflowProcessList);
workflows.get("/name/:name", workflowCtrl.fetchWorkflowByName);
workflows.post("/", wfValidator.validateSaveWorkflow, wfValidator.validateConnections, wfValidator.validateNodes, workflowCtrl.saveWorkflow);
workflows.post("/:id/create", baseValid.validateUUID, wfValidator.validateCreateProcess, workflowCtrl.createProcess);
workflows.post("/name/:name/create", workflowCtrl.createProcessByName);
workflows.post("/name/:workflowName/start", workflowCtrl.createAndRunProcessByName);
workflows.post("/diagram", diagramCtrl.buildDiagram);
workflows.post("/diagram/convert", diagramCtrl.buildBlueprint);
workflows.delete("/:id", baseValid.validateUUID, workflowCtrl.deleteWorkflow);
router.use("/workflows", workflows);
const processes = (0, express_1.Router)();
processes.get("/", processCtrl.fetchProcessList);
processes.post("/", processValid.validateFindProcesses, processCtrl.listProcesses);
processes.get("/available", activityCtrl.fetchAvailableActivitiesForActor);
processes.get("/done", activityCtrl.fetchDoneActivitiesForActor);
processes.get("/:id/state", baseValid.validateUUID, processCtrl.fetchProcess);
processes.get("/:id/history", baseValid.validateUUID, processCtrl.fetchProcessStateHistory);
processes.get("/:id/activity", baseValid.validateUUID, activityCtrl.fetchActivity);
processes.get("/activityManager/:id", baseValid.validateUUID, activityCtrl.fetchActivityByActivityManagerId);
processes.post("/:id/run", baseValid.validateUUID, processValid.validateRunProcess, processCtrl.runProcess);
processes.post("/:id/abort", baseValid.validateUUID, processCtrl.abortProcess);
processes.post("/:id/commit", baseValid.validateUUID, activityCtrl.commitActivity);
processes.post("/:id/push", baseValid.validateUUID, activityCtrl.pushActivity);
processes.post("/:id/continue", baseValid.validateUUID, processCtrl.continueProcess);
router.use("/processes", processes);
const states = (0, express_1.Router)();
states.get("/:id", baseValid.validateUUID, statesCtrl.fetchById);
states.get("/:id/execution", baseValid.validateUUID, statesCtrl.calculateExecutionData);
states.get("/:id/spec", baseValid.validateUUID, statesCtrl.fetchSpec);
states.get("/process/:id", baseValid.validateUUID, statesCtrl.fetchStateByParameters);
states.get("/:id/context", baseValid.validateUUID, statesCtrl.fetchStateExecution);
states.get("/process/:process_id/node/:node_id", baseValid.validateUUID, statesCtrl.fetchMultipleStateExecution);
router.use("/states", states);
const activityManager = (0, express_1.Router)();
activityManager.post("/:id/commit", baseValid.validateUUID, activityCtrl.commitByActivityManagerId);
activityManager.post("/:id/submit", baseValid.validateUUID, activityCtrl.submitByActivityManagerId);
router.use("/activity_manager", activityManager);
const activities = (0, express_1.Router)();
activities.get("/available", activityCtrl.fetchAvailableActivitiesForActorReduced);
router.use("/activities", activities);
const packages = (0, express_1.Router)();
packages.get("/:id", baseValid.validateUUID, packageCtrl.fetchPackage);
packages.post("/", packageCtrl.savePackage);
packages.delete("/:id", baseValid.validateUUID, packageCtrl.deletePackage);
router.use("/packages", packages);
exports.default = router;
