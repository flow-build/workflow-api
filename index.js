const freeRouter = require("./src/routers/freeRouter");
const mainRouter = require("./src/routers/mainRouter");
const cockpitRouter = require("./src/routers/cockpitRouter");
const { setEngine, setCockpit } = require("./src/engine");

module.exports = {
  freeRouter,
  mainRouter,
  cockpitRouter,
  setEngine,
  setCockpit,
};
