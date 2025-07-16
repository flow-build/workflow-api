import * as cam from "../controllers/cockpit/activityManager"
import * as ev from "../controllers/cockpit/environmentVariable"
import { fetchNode, getNodes } from "../controllers/cockpit/nodes"
import * as cp from "../controllers/cockpit/process"
import * as pt from "../controllers/cockpit/processTree"
import * as cockpitController from "../controllers/cockpit/workflow"
import * as connectionCtrl from "../controllers/connection"
import * as workflowCtrl from "../controllers/workflow"
import { captureActorData } from "../middlewares/actordata"
import { validateUUID } from "../validators/base"
import * as cockpitValidator from "../validators/cockpit"
import * as wv from "../validators/workflow"

import cors from "cors"
import express, { Router } from "express"

const router = Router()

router.use(express.json())
router.use(captureActorData)
router.use(cors())

// Connection
const connection = Router()
connection.post("/beacon", connectionCtrl.sendBeacon)
router.use("/connection", connection)

// Workflows
const workflows = Router()
workflows.get("/stats", cockpitController.fetchWorkflowsWithProcessStatusCount)
workflows.get("/:id/processes", validateUUID, cp.getProcessesByWorkflowId)
workflows.get("/name/:name/processes", cp.getProcessesByWorkflowName)
workflows.get("/name/:name/states/:node_id", cp.getStatesFromNode)
workflows.get("/variables", workflowCtrl.listWorkflowsEnviromentVariables)
workflows.post("/validate", wv.validateSaveWorkflow, workflowCtrl.validateBlueprint)
workflows.post("/compare", wv.validateSaveWorkflow, workflowCtrl.compareBlueprint)
router.use("/workflows", workflows)

// Processes
const processes = Router()
processes.get("/:id/execution", validateUUID, cp.getProcessStateExecutionHistory)
processes.post("/:id/state", validateUUID, cockpitValidator.validateSetProcessState, cp.setProcessState)
processes.post("/:id/state/run", validateUUID, cp.runPendingProcess)
processes.post("/:id/set/:state_id", validateUUID, cp.transferProcessState)
processes.get("/:id/tree", validateUUID, pt.getProcessTree)
processes.post("/:id/expire", validateUUID, cp.expireProcess)
router.use("/processes", processes)

// Nodes
const nodes = Router()
nodes.get("/", getNodes)
nodes.post("/", cockpitValidator.validateFetchNodeSchema, fetchNode)
router.use("/nodes", nodes)

// Activity Manager
const activityManager = Router()
activityManager.post("/:id/expire", validateUUID, cam.expire)
router.use("/activities", activityManager)

// Environment Variables
const envs = Router()
envs.get("/", ev.getEnvironmentVariables)
envs.get("/:key", ev.getEnvironmentVariable)
envs.post("/", cockpitValidator.validateEnvironmentSchema, ev.saveEnvironmentVariable)
envs.delete("/:key", ev.deleteEnvironmentVariable)
router.use("/envs", envs)

export default router
