let engine;
function getEngine() {
  return engine;
}

function setEngine(engine_) {
  engine = engine_;
}

let cockpit;
function getCockpit() {
  return cockpit;
}

function setCockpit(cockpit_) {
  cockpit = cockpit_;
}

module.exports = {
  getEngine: getEngine,
  setEngine: setEngine,
  getCockpit: getCockpit,
  setCockpit: setCockpit
};
