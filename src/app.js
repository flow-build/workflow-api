//KOA
const Koa = require("koa");
const cors = require("koa2-cors");
const koaLogger = require("koa-logger-winston");
const jwt = require("koa-jwt");

//ROUTERS
const freeRouter = require("./routers/freeRouter");
const mainRouter = require("./routers/mainRouter");
const cockpitRouter = require("./routers/cockpitRouter");

//ENGINE
const { setEngine, getEngine, setCockpit, getCockpit } = require("./engine");
const { Engine, Cockpit } = require("@flowbuild/engine");
const cockpitService = require("./services/cockpit");
const { setCustomNodes } = require("../src/nodes");

//UTILS
const _log = require("./utils/logger");
const _notifier = require("./utils/notifier");
const { db } = require("./utils/db");
const { jwtSecret } = require("./utils/jwtSecret");
const { setPersist } = require("./middlewares/persist");


const startServer = (port) => {
  const engineLogLevel = process.env.ENGINE_LOG_LEVEL || "error";

  let engine = getEngine();
  if (!engine) {
    engine = new Engine("knex", db, engineLogLevel);
    setEngine(engine);
  }
  let cockpit = getCockpit();
  if (!cockpit) {
    cockpit = new Cockpit("knex", db, engineLogLevel);
    setCockpit(cockpit);
    cockpitService.setDbConnection(db);
  }
  setCustomNodes();

  _notifier.activateNotifiers(engine);

  const app = new Koa();
  const corsOptions = {
    origin: "*",
    allowMethods: ["GET", "POST", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization", "Accept", "x-duration", "x-secret"],
  };
  app.use(cors(corsOptions));
  app.use(setPersist(db));

  app.use(koaLogger(_log.logger));
  _log.startLogger();

  app.use(freeRouter({ corsOptions }).routes());

  app.use(
    mainRouter({
      corsOptions,
      middlewares: [jwt({ secret: jwtSecret, debug: true })],
    }).routes()
  );

  app.use(
    cockpitRouter({
      corsOptions,
      middlewares: [jwt({ secret: jwtSecret, debug: true })],
    })
      .prefix("/cockpit")
      .routes()
  );

  return app.listen(port, function () {
    _log.logger.info("Flowbuild API Server running");
  });
};

module.exports = {
  startServer,
};
