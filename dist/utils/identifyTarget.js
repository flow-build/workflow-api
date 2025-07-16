"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identifyTarget = identifyTarget;
const logger_1 = require("./logger");
function identifyTarget(spec) {
    try {
        const { nodes } = spec;
        const startNode = nodes.find(node => node.type.toLowerCase() === "start");
        if (!startNode)
            throw new Error("Start Node not found");
        const { parameters } = startNode;
        if (parameters && parameters.target) {
            return [true, parameters.target];
        }
        return [false];
    }
    catch (e) {
        logger_1.logger.error("Error: ", e);
        return [false];
    }
}
