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

  const workflows = Router();
  workflows.prefix("/workflows");
  workflows.get("/stats", cockpitController.fetchWorkflowsWithProcessStatusCount);
  workflows.get("/:id/processes", validateUUID, cp.getProcessesByWorkflowId);
  workflows.get("/name/:name/processes", cp.getProcessesByWorkflowName);
  workflows.get("/name/:name/states/:node_id", cp.getStatesFromNode);
  workflows.get("/variables", workflowCtrl.listWorkflowsEnviromentVariables);
  workflows.post("/validate", wv.saveWorkflow, workflowCtrl.validateBlueprint);
  workflows.post("/compare", wv.saveWorkflow, workflowCtrl.compareBlueprint);

  const processes = Router();
  processes.prefix("/processes");
  processes.get("/:id/execution", validateUUID, cp.getProcessExecution);
  processes.post("/:id/state", validateUUID, cockpitValidator.validateSetProcessState, cp.setProcessState);
  processes.post("/:id/state/run", validateUUID, cp.runPendingProcess);
  processes.post("/:id/set/:state_id", validateUUID, cp.transferProcessState);
  
  router.use(processes.routes());
  router.use(workflows.routes());

  return router;
};
