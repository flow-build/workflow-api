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
exports.activateNotifiers = activateNotifiers;
const logger_1 = require("./logger");
const namespace = process.env.MQTT_NAMESPACE;
const env_1 = require("../config/env");
const index_1 = require("../services/broker/index");
const db_1 = require("./db");
const process_tree_1 = require("@flowbuild/process-tree");
const tree = new process_tree_1.Tree(db_1.db);
function processStateListener(processState) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        if (processState.step_number === 1) {
            const processId = processState.process_id;
            const parentId = ((_a = processState.bag.parent_process_data) === null || _a === void 0 ? void 0 : _a.id)
                || ((_b = processState.actor_data.parentProcessData) === null || _b === void 0 ? void 0 : _b.id);
            if (parentId) {
                logger_1.logger.debug(`PS LISTENER: Process Tree, appendChild PID ${processId}`);
                yield tree.appendChild({ parentId, processId });
            }
            else {
                logger_1.logger.debug(`PS LISTENER: Process Tree, create tree PID ${processId}`);
                yield tree.createTree(processId);
            }
        }
        if (process.env.PUBLISH_STATE_EVENTS) {
            const topic = namespace
                ? `/${namespace}/process/${processState.process_id}/state`
                : `/process/${processState.process_id}/state`;
            const message = {
                stateId: processState.id,
                processId: processState.process_id,
                stepNumber: processState.step_number,
                nodeId: processState.node_id,
                status: processState.status,
                workflow: processState.workflow_name,
                result: processState.result,
                error: processState.error,
                stateDate: processState.created_at,
                bag: processState.bag,
                actorData: processState.actor_data,
                processCreatedAt: processState.process_created_at,
                workflowId: processState.workflow_id
            };
            (0, index_1.publishMessage)({ topic, message }, process.env.PROCESS_STATE_BROKER || "MQTT");
            logger_1.logger.info(`PS LISTENER: PID [${processState.process_id}] SID [${processState.id}], step [${processState.step_number}], status [${processState.status}]`);
        }
    });
}
function activityManagerListener(activityManager) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        logger_1.logger.info(`[utils engine listener] activityManagerListener, AMID: ${activityManager._id}`);
        const skipListener = process.env.ACTIVITY_MANAGER_SEND_ONLY_ON_CREATION === "true"
            && (((_a = activityManager._activities) === null || _a === void 0 ? void 0 : _a.length) > 0
                || activityManager._status !== "started");
        if (!activityManager._id || skipListener) {
            return;
        }
        let topic = namespace
            ? `/${namespace}/process/${activityManager._process_id}/am/create`
            : `/process/${activityManager._process_id}/am/create`;
        const message = {
            process_id: activityManager._process_id,
            id: activityManager._id,
            status: activityManager._status,
            props: activityManager._props
        };
        (0, index_1.publishMessage)({ topic, message, context: activityManager }, process.env.ACTIVITY_MANAGER_BROKER || "MQTT");
        if ((_c = (_b = activityManager === null || activityManager === void 0 ? void 0 : activityManager._props) === null || _b === void 0 ? void 0 : _b.result) === null || _c === void 0 ? void 0 : _c.session_id) {
            topic = namespace
                ? `/${namespace}/session/${activityManager._props.result.session_id}/am/create`
                : `/session/${activityManager._props.result.session_id}/am/create`;
            (0, index_1.publishMessage)({ topic, message, activityManager }, process.env.ACTIVITY_MANAGER_BROKER || "MQTT");
        }
        else {
            logger_1.logger.info("AM LISTENER: No session provided");
        }
        if ((_e = (_d = activityManager === null || activityManager === void 0 ? void 0 : activityManager._props) === null || _d === void 0 ? void 0 : _d.result) === null || _e === void 0 ? void 0 : _e.actor_id) {
            topic = namespace
                ? `/${namespace}/actor/${activityManager._props.result.actor_id}/am/create`
                : `/actor/${activityManager._props.result.actor_id}/am/create`;
            (0, index_1.publishMessage)({ topic, message, activityManager }, process.env.ACTIVITY_MANAGER_BROKER || "MQTT");
        }
        else {
            logger_1.logger.info("AM LISTENER: No actor provided");
        }
    });
}
function eventNodeNotifier(eventData) {
    return __awaiter(this, void 0, void 0, function* () {
        const namespace = env_1.envs.FLOWBUILD.EVENTS.NAMESPACE;
        const { event, execution_data } = eventData;
        if (event.family === "target") {
            yield (0, index_1.publishMessage)({
                context: {
                    topic: `${namespace ? `${namespace}.` : ""}wem.process.target.create`,
                    message: {
                        event,
                        execution_data
                    }
                }
            }, process.env.WORKFLOW_EVENTS_BROKER || "KAFKA");
        }
        else if (event.family === "trigger") {
            const { definition } = event;
            yield (0, index_1.publishMessage)({
                context: {
                    topic: `WORKFLOW_EVENT-${definition}`,
                    message: {
                        process_input: execution_data,
                        target_process_id: (execution_data === null || execution_data === void 0 ? void 0 : execution_data.target_process_id) || "",
                        trigger_process_id: (execution_data === null || execution_data === void 0 ? void 0 : execution_data.trigger_process_id) || ""
                    }
                }
            }, process.env.WORKFLOW_EVENTS_BROKER || "KAFKA");
        }
    });
}
function activateNotifiers(engine) {
    engine.setProcessStateNotifier(processStateListener);
    engine.setActivityManagerNotifier(activityManagerListener);
    engine.setEventNodeNotifier(eventNodeNotifier);
}
