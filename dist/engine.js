"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEngine = getEngine;
exports.setEngine = setEngine;
exports.getCockpit = getCockpit;
exports.setCockpit = setCockpit;
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
