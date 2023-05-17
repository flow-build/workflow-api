const Router = require("@koa/router");
const bodyParser = require("koa-bodyparser");
const cors = require("koa2-cors");

const { captureActorData } = require("../middlewares/actordata");
const { validateUUID } = require("../validators/base");
const cockpitController = require("../controllers/cockpit/workflow");
const cockpitValidator = require("../validators/cockpit");
const wv = require("../validators/workflow");
const workflowCtrl = require("../controllers/workflow");
const cp = require("../controllers/cockpit/process");
const pt = require("../controllers/cockpit/processTree");
const cam = require("../controllers/cockpit/activityManager");
const ev = require("../controllers/cockpit/environmentVariable");
const { getNodes, fetchNode } = require("../controllers/cockpit/nodes")

module.exports = (opts = {}) => {
  const router = new Router();

  router.use(bodyParser());

  for (let middleware of opts.middlewares) {
    router.use(middleware);
  }

  router.use(captureActorData);

  router.use(cors(opts.corsOptions));

  if (opts.routes) {
    for (let route of opts.routes) {
      router[route.verb](route.path, ...route.methods);
    }
  }

  const workflows = new Router();
  workflows.prefix("/workflows");
  workflows.get("/stats", cockpitController.fetchWorkflowsWithProcessStatusCount);
  workflows.get("/:id/processes", validateUUID, cp.getProcessesByWorkflowId);
  workflows.get("/name/:name/processes", cp.getProcessesByWorkflowName);
  workflows.get("/name/:name/states/:node_id", cp.getStatesFromNode);
  workflows.get("/variables", workflowCtrl.listWorkflowsEnviromentVariables);
  workflows.post("/validate", wv.saveWorkflow, workflowCtrl.validateBlueprint);
  workflows.post("/compare", wv.saveWorkflow, workflowCtrl.compareBlueprint);

  const processes = new Router();
  processes.prefix("/processes");
  processes.get("/:id/execution", validateUUID, cp.getProcessStateExecutionHistory);
  processes.post("/:id/state", validateUUID, cockpitValidator.validateSetProcessState, cp.setProcessState);
  processes.post("/:id/state/run", validateUUID, cp.runPendingProcess);
  processes.post("/:id/set/:state_id", validateUUID, cp.transferProcessState);
  processes.get("/:id/tree", validateUUID, pt.getProcessTree);
  processes.post("/:id/expire", validateUUID, cp.expireProcess);

  const nodes = new Router();
  nodes.prefix("/nodes");
  nodes.get('/', getNodes)
  nodes.post("/", cockpitValidator.validateFetchNodeSchema, fetchNode)

  const activityManager = new Router();
  activityManager.prefix("/activities");
  activityManager.post("/:id/expire", validateUUID, cam.expire)

  const envs = new Router();
  envs.prefix("/envs");
  envs.get("/", ev.getEnvironmentVariables);
  envs.get("/:key", ev.getEnvironmentVariable);
  envs.post("/", cockpitValidator.validateEnvironmentSchema, ev.saveEnvironmentVariable);
  envs.delete("/:key", ev.deleteEnvironmentVariable);

  router.use(processes.routes());
  router.use(workflows.routes());
  router.use(nodes.routes());
  router.use(activityManager.routes());
  router.use(envs.routes());

  return router;
};
