const Koa = require("koa");
const cors = require("koa2-cors");
const koaLogger = require("koa-logger-winston");
const jwt = require("koa-jwt");

const freeRouter = require("./routers/freeRouter");
const mainRouter = require("./routers/mainRouter");
const cockpitRouter = require("./routers/cockpitRouter");

const { setEngine, getEngine, setCockpit, getCockpit } = require("./engine");
const { Engine, Cockpit } = require("@flowbuild/engine");
const cockpitService = require("./services/cockpit");
const { setCustomNodes } = require("../src/nodes");

const _log = require("./utils/logger");
const listeners = require("./utils/engineListener");
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

  listeners.activateNotifiers(engine);

  const crypto = engine.buildCrypto("aes-256-cbc", {
    key: process.env.CRYPTO_KEY || "12345678901234567890123456789012",
  });
  engine.setCrypto(crypto);

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
