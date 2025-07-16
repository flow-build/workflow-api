"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishWorkflow = publishWorkflow;
const broker_1 = require("../services/broker");
const identifyTarget_1 = require("../utils/identifyTarget");
const env_1 = require("src/config/env");
const namespace = env_1.envs.FLOWBUILD.EVENTS.NAMESPACE;
function publishWorkflow(workflow) {
    return __awaiter(this, void 0, void 0, function* () {
        const [hasTarget, event] = (0, identifyTarget_1.identifyTarget)(workflow.blueprint);
        let topic = (namespace)
            ? `${namespace}.wem.workflow.target.create`
            : `wem.workflow.target.create`;
        if (env_1.envs.FLOWBUILD.EVENTS.BROKER === "MQTT") {
            topic = (namespace)
                ? `/${namespace}/workflow/${workflow.id}/create`
                : `/workflow/${workflow.id}/create`;
        }
        (0, broker_1.publishMessage)({
            context: {
                topic,
                message: {
                    name: workflow.name,
                    workflow_id: workflow.id,
                    hash: workflow.hash,
                    hasTarget: hasTarget,
                    event: event,
                    version: workflow.version
                }
            }
        }, env_1.envs.FLOWBUILD.EVENTS.BROKER);
    });
}
