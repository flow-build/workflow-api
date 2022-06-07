const Router = require("@koa/router");
const bodyParser = require("koa-bodyparser");
const cors = require("koa2-cors");

const { captureActorData } = require("../middlewares/actordata");
const { captureTraceData } = require("../middlewares/trace");
const { captureUserAgentAndIp } = require("../middlewares/userAgent");

const baseValid = require("../validators/base");
const processValid = require("../validators/process");
const wfValidator = require("../validators/workflow");

const activityCtrl = require("../controllers/activity");
const diagramCtrl = require("../controllers/diagram");
const processCtrl = require("../controllers/process");
const packageCtrl = require("../controllers/package");
const workflowCtrl = require("../controllers/workflow");
const statesCtrl = require('../controllers/state');
const { indexController } = require("@flowbuild/indexer");

module.exports = (opts = {}) => {
  const router = new Router();

  router.use(bodyParser());

  for (let middleware of opts.middlewares) {
    router.use(middleware);
  }

  router.use(captureActorData);
  router.use(captureTraceData);
  router.use(captureUserAgentAndIp);

  router.use(cors(opts.corsOptions));

  if (opts.routes) {
    for (let route of opts.routes) {
      router[route.verb](route.path, ...route.methods);
    }
  }

  const workflows = Router();
  workflows.prefix("/workflows");
  workflows.get("/", workflowCtrl.getWorkflowsForActor);
  workflows.get("/:id", baseValid.validateUUID, workflowCtrl.fetchWorkflow);
  workflows.get("/:id/processes", baseValid.validateUUID, workflowCtrl.fetchWorkflowProcessList);
  workflows.get("/name/:name", workflowCtrl.fetchWorkflowByName);
  workflows.post(
    "/",
    wfValidator.saveWorkflow,
    wfValidator.validateConnections,
    wfValidator.validateNodes,
    workflowCtrl.saveWorkflow
  );
  workflows.post("/:id/create", baseValid.validateUUID, wfValidator.createProcess, workflowCtrl.createProcess);
  workflows.post("/name/:name/create", workflowCtrl.createProcessByName);
  workflows.post("/name/:workflowName/start", workflowCtrl.createAndRunProcessByName);
  workflows.post("/diagram", diagramCtrl.buildDiagram);
  workflows.post("/diagram/convert", diagramCtrl.buildBlueprint);
  workflows.delete("/:id", baseValid.validateUUID, workflowCtrl.deleteWorkflow);

  const processes = Router();
  processes.prefix("/processes");
  processes.get("/", processCtrl.fetchProcessList);
  processes.post("/", processValid.findProcesses, processCtrl.listProcesses);
  processes.get("/available", activityCtrl.fetchAvailableActivitiesForActor);
  processes.get("/done", activityCtrl.fetchDoneActivitiesForActor);
  processes.get("/:id/state", baseValid.validateUUID, processCtrl.fetchProcess);
  processes.get("/:id/history", baseValid.validateUUID, processCtrl.fetchProcessStateHistory);
  processes.get("/:id/activity", baseValid.validateUUID, activityCtrl.fetchActivity);
  processes.get("/activityManager/:id", baseValid.validateUUID, activityCtrl.fetchActivityByActivityManagerId);
  processes.post("/:id/run", baseValid.validateUUID, processValid.runProcess, processCtrl.runProcess);
  processes.post("/:id/abort", baseValid.validateUUID, processCtrl.abortProcess);
  processes.post("/:id/commit", baseValid.validateUUID, activityCtrl.commitActivity);
  processes.post("/:id/push", baseValid.validateUUID, activityCtrl.pushActivity);
  processes.post("/:id/continue", baseValid.validateUUID, processCtrl.continueProcess);

  const states = Router();
  states.prefix("/states");
  states.get("/:id", baseValid.validateUUID, statesCtrl.fetchById);
  states.get("/process/:id", baseValid.validateUUID, statesCtrl.fetchStateByParameters);

  const activityManager = Router();
  activityManager.prefix("/activity_manager");
  activityManager.post("/:id/commit", baseValid.validateUUID, activityCtrl.commitByActivityManagerId);
  activityManager.post("/:id/submit", baseValid.validateUUID, activityCtrl.submitByActivityManagerId);

  const activities = Router();
  activities.prefix("/activities");
  activities.get("/available", activityCtrl.fetchAvailableActivitiesForActorReduced);

  const packages = Router();
  packages.prefix("/packages");
  packages.get("/:id", baseValid.validateUUID, packageCtrl.fetchPackage);
  packages.post("/", packageCtrl.savePackage);
  packages.delete("/:id", baseValid.validateUUID, packageCtrl.deletePackage);

  const indexer = Router();
  indexer.prefix("/index");
  indexer.post("/", indexController.createIndex);
  indexer.get("/entity/:id", indexController.readProcessesByEntity);
  indexer.get("/entity/type/:type", indexController.readProcessesByEntityType);
  indexer.get("/process/:id", indexController.readEntitiesByProcess);
  indexer.delete("/process/:id", indexController.deleteIndexFromProcess);
  indexer.delete("/entity/:id", indexController.deleteIndexFromEntity);
  indexer.delete("/:id", indexController.deleteIndex);

  router.use(processes.routes());
  router.use(states.routes());
  router.use(workflows.routes());

  router.use(activityManager.routes());
  router.use(activities.routes());
  router.use(packages.routes());

  router.use(indexer.routes());

  return router;
};
