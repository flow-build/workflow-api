const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const { captureActorData,
     validateUUID } = require("./middlewares");
const wc = require("./controllers/workflow");
const ac = require("./controllers/activity");
const pc = require("./controllers/process");
const pkc = require("./controllers/package");
const wv = require("./validators/workflow");
const pv = require("./validators/process");
const cors = require('koa2-cors');

module.exports = (opts = {}) => {
     const router = new Router();

     router.use(bodyParser());

     for (let middleware of opts.middlewares) {
          router.use(middleware);
     }

     router.use(captureActorData);

     router.use(cors(opts.corsOptions));

     router
          .post("/workflows",
               wv.saveWorkflow,
               wc.saveWorkflow)
          .get("/workflows",
               wc.getWorkflowsForActor)
          .get("/workflows/:id",
               validateUUID,
               wc.fetchWorkflow)
          .get("/workflows/:id/status",
               validateUUID,
               pc.fetchProcessCountFromStatus)
          .get("/workflows/:id/processes",
               validateUUID,
               wc.fetchWorkflowProcessList)
          .delete("/workflows/:id",
               validateUUID,
               wc.deleteWorkflow)
          .post("/workflows/:id/create",
               validateUUID,
               wv.createProcess,
               wc.createProcess)
          .post("/workflows/name/:name/create",
               wc.createProcessByName)

          .get("/processes/activityManager/:id",
               validateUUID,
               ac.fetchActivityByActivityManagerId)
          .get("/processes/available",
               ac.fetchAvailableActivitiesForActor)
          .get("/processes/done",
               ac.fetchDoneActivitiesForActor)
          .get("/processes/:id/activity",
               validateUUID,
               ac.fetchActivity)
          .post("/processes/:process_id/commit",
               validateUUID,
               ac.commitActivity)
          .post("/processes/:process_id/push",
               validateUUID,
               ac.pushActivity)

          .get("/processes/",
               validateUUID,
               pc.fetchProcessList)
          .get("/processes/:id/",
               validateUUID,
               pc.fetchProcess)
          .get("/processes/:id/history",
               validateUUID,
               pc.fetchProcessStateHistory)
          .post("/processes/:id/run",
               validateUUID,
               pv.runProcess,
               pc.runProcess)
          .post("/processes/:id/abort",
               validateUUID,
               pc.abortProcess)
          .post("/processes/:id/state",
               validateUUID,
               pv.setProcessState,
               pc.setProcessState)
          .post("/packages",
               pkc.savePackage)
          .get("/packages/:id",
               validateUUID,
               pkc.fetchPackage)
          .delete("/packages/:id",
               validateUUID,
               pkc.deletePackage)

          .post("/activity_manager/:activity_manager_id/submit",
               validateUUID,
               ac.submitByActivityManagerId
          )

     return router;
};
