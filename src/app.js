const Koa = require("koa");
const router = require("./router");
const cockpit_router = require("./cockpit_router");
const cors = require('koa2-cors');
const jwt = require("koa-jwt");
const { setEngine, getEngine, setCockpit, getCockpit } = require("./engine");
const { Engine, Cockpit } = require("@fieldlink/workflow-engine");
const { db } = require("./tests/utils/db");

const startServer = (port) => {
  let engine = getEngine();
  if (!engine) {
    engine = new Engine("knex", db);
    setEngine(engine);
  }
  let cockpit = getCockpit();
  if (!cockpit) {
    cockpit = new Cockpit("knex", db);
    setCockpit(cockpit);
  }

  const app = new Koa();
  const corsOptions = {
    origin: '*',
    allowMethods: ['GET', 'POST', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept']
  }
  app.use(cors(corsOptions));
  app.use(router({ corsOptions: corsOptions,
                   middlewares: [
                     jwt({ secret: "1234", debug: true })
                   ]
                 }).routes());
  const cockpit_routes = cockpit_router({
    corsOptions: corsOptions,
    middlewares: [
      jwt({ secret: "1234", debug: true })
    ]
  }).prefix('/cockpit').routes()
  app.use(cockpit_routes);
  return app.listen(port, function () {
    console.log("Server running")
  });
};

module.exports = {
  startServer
};
