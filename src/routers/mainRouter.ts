import * as activityCtrl from "../controllers/activity"
import * as diagramCtrl from "../controllers/diagram"
import * as packageCtrl from "../controllers/package"
import * as processCtrl from "../controllers/process"
import * as statesCtrl from "../controllers/state"
import * as workflowCtrl from "../controllers/workflow"
import { captureActorData } from "../middlewares/actordata"
import { captureTraceData } from "../middlewares/trace"
import { captureUserAgentAndIp } from "../middlewares/userAgent"
import * as baseValid from "../validators/base"
import * as processValid from "../validators/process"
import * as wfValidator from "../validators/workflow"

import cors from "cors"
import express, { Router } from "express"
// import { indexController } from "@flowbuild/indexer"; // Uncomment and fix if you have types for this

const router = Router()

router.use(express.json())
router.use(captureActorData)
router.use(captureTraceData)
router.use(captureUserAgentAndIp)
router.use(cors())

// Workflows
const workflows = Router()
workflows.get("/", workflowCtrl.getWorkflowsForActor)
workflows.get("/:id", baseValid.validateUUID, workflowCtrl.fetchWorkflow)
workflows.get("/:id/processes", baseValid.validateUUID, workflowCtrl.fetchWorkflowProcessList)
workflows.get("/name/:name", workflowCtrl.fetchWorkflowByName)
workflows.post(
  "/",
  wfValidator.validateSaveWorkflow,
  wfValidator.validateConnections,
  wfValidator.validateNodes,
  workflowCtrl.saveWorkflow
)
workflows.post("/:id/create", baseValid.validateUUID, wfValidator.validateCreateProcess, workflowCtrl.createProcess)
workflows.post("/name/:name/create", workflowCtrl.createProcessByName)
workflows.post("/name/:workflowName/start", workflowCtrl.createAndRunProcessByName)
workflows.post("/diagram", diagramCtrl.buildDiagram)
workflows.post("/diagram/convert", diagramCtrl.buildBlueprint)
workflows.delete("/:id", baseValid.validateUUID, workflowCtrl.deleteWorkflow)
router.use("/workflows", workflows)

// Processes
const processes = Router()
processes.get("/", processCtrl.fetchProcessList)
processes.post("/", processValid.validateFindProcesses, processCtrl.listProcesses)
processes.get("/available", activityCtrl.fetchAvailableActivitiesForActor)
processes.get("/done", activityCtrl.fetchDoneActivitiesForActor)
processes.get("/:id/state", baseValid.validateUUID, processCtrl.fetchProcess)
processes.get("/:id/history", baseValid.validateUUID, processCtrl.fetchProcessStateHistory)
processes.get("/:id/activity", baseValid.validateUUID, activityCtrl.fetchActivity)
processes.get("/activityManager/:id", baseValid.validateUUID, activityCtrl.fetchActivityByActivityManagerId)
processes.post("/:id/run", baseValid.validateUUID, processValid.validateRunProcess, processCtrl.runProcess)
processes.post("/:id/abort", baseValid.validateUUID, processCtrl.abortProcess)
processes.post("/:id/commit", baseValid.validateUUID, activityCtrl.commitActivity)
processes.post("/:id/push", baseValid.validateUUID, activityCtrl.pushActivity)
processes.post("/:id/continue", baseValid.validateUUID, processCtrl.continueProcess)
router.use("/processes", processes)

// States
const states = Router()
states.get("/:id", baseValid.validateUUID, statesCtrl.fetchById)
states.get("/:id/execution", baseValid.validateUUID, statesCtrl.calculateExecutionData)
states.get("/:id/spec", baseValid.validateUUID, statesCtrl.fetchSpec)
states.get("/process/:id", baseValid.validateUUID, statesCtrl.fetchStateByParameters)
states.get("/:id/context", baseValid.validateUUID, statesCtrl.fetchStateExecution)
states.get("/process/:process_id/node/:node_id", baseValid.validateUUID, statesCtrl.fetchMultipleStateExecution)
router.use("/states", states)

// Activity Manager
const activityManager = Router()
activityManager.post("/:id/commit", baseValid.validateUUID, activityCtrl.commitByActivityManagerId)
activityManager.post("/:id/submit", baseValid.validateUUID, activityCtrl.submitByActivityManagerId)
router.use("/activity_manager", activityManager)

// Activities
const activities = Router()
activities.get("/available", activityCtrl.fetchAvailableActivitiesForActorReduced)
router.use("/activities", activities)

// Packages
const packages = Router()
packages.get("/:id", baseValid.validateUUID, packageCtrl.fetchPackage)
packages.post("/", packageCtrl.savePackage)
packages.delete("/:id", baseValid.validateUUID, packageCtrl.deletePackage)
router.use("/packages", packages)

// Indexer (commented out, add if you have types for indexController)
// const indexer = Router();
// indexer.post("/", indexController.createIndex);
// indexer.get("/entity/:id", indexController.readProcessesByEntity);
// indexer.get("/entity/type/:type", indexController.readProcessesByEntityType);
// indexer.get("/process/:id", indexController.readEntitiesByProcess);
// indexer.delete("/process/:id", indexController.deleteIndexFromProcess);
// indexer.delete("/entity/:id", indexController.deleteIndexFromEntity);
// indexer.delete("/:id", indexController.deleteIndex);
// router.use("/index", indexer);

export default router
