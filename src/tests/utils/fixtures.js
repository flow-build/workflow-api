const { Engine, Cockpit } = require("@flowbuild/engine");
const { cleanDb } = require("../utils/auxiliar");
const { setEngine, setCockpit } = require("../../engine");


module.exports.tearDownEnvironment = async (server, db) => {
  Engine.kill();
  await cleanDb();
  await db.destroy();
  await server.close();
}

module.exports.createTestEngine = (db) => {
  const engine = new Engine("knex", db, process.env.ENGINE_LOG_LEVEL);
  setEngine(engine);
  return engine
}

module.exports.createTestCockpit = (db) => {
  const cockpit = new Cockpit("knex", db, process.env.ENGINE_LOG_LEVEL);
  setCockpit(cockpit);
  return cockpit
}

