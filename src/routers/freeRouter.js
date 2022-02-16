const Router = require("@koa/router");
const bodyParser = require("koa-bodyparser");
const cors = require("koa2-cors");
const healthCtrl = require("../controllers/healthcheck");
const tokenCtrl = require("../controllers/token");

module.exports = (opts = {}) => {
  const router = new Router();

  router.use(bodyParser());
  router.use(cors(opts.corsOptions));

  //main routes, no validation, no middleware
  router.get("/", healthCtrl.healthCheck);
  router.get("/healthcheck", healthCtrl.healthCheck);
  router.post("/token", tokenCtrl.getToken);

  return router;
};
