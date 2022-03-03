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
const nodesCtrl = require('../controllers/cockpit/nodes');
const specValidator = require('../validators/nodeSpec');
const specCtrl = require("../controllers/cockpit/specs");
const contextCtrl = require('../controllers/cockpit/context');

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
  
  const nodes = Router();
  nodes.prefix("/nodes");
  nodes.post("/dry/run", nodesCtrl.dryRunNode);
  nodes.post("/dry/prepare", nodesCtrl.prepareNodeDry);
  nodes.post("/state/:id/prepare", validateUUID, nodesCtrl.prepareNode);
  nodes.post("/state/:id/run", validateUUID, nodesCtrl.runNode);

  const specs = Router();
  specs.prefix("/specs");
  specs.get("/:id", validateUUID, specCtrl.getSpec);
  specs.get("/name/:name", specCtrl.getSpecByName);
  specs.get("/type/:type", specCtrl.listSpecByType);
  specs.post("/", specValidator.validateNodeSchema, specCtrl.createSpec);
  specs.patch("/:id", validateUUID, specValidator.validateNodeSchema, specCtrl.createSpec);

  const context = Router();
  context.prefix("/context");
  context.get("/", contextCtrl.listContext);
  context.get("/:id", validateUUID, contextCtrl.getContext);
  context.get("/workflow/:name/node/:nodeId", contextCtrl.listContextByNode);
  context.post("/", contextCtrl.createContext);
  context.patch("/:id", validateUUID, contextCtrl.createContext);

  router.use(processes.routes());
  router.use(workflows.routes());
  router.use(nodes.routes());
  router.use(specs.routes());
  router.use(context.routes());

  return router;
};
