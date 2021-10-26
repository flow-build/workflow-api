const Router = require("@koa/router");
const bodyParser = require("koa-bodyparser");
const cors = require("koa2-cors");
const healthCtrl = require("../controllers/healthCheck");
const tokenCtrl = require("../controllers/token");

module.exports = (opts = {}) => {
  const mainRouter = new Router();

  mainRouter.use(bodyParser());
  mainRouter.use(cors(opts.corsOptions));

  //main routes, no validation, no middleware
  mainRouter.get("/", healthCtrl.healthCheck);
  mainRouter.get("/healthcheck", healthCtrl.healthCheck);
  mainRouter.post("/token", tokenCtrl.getToken);

  return mainRouter;
};
