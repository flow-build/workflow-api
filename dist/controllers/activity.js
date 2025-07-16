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
exports.fetchAvailableActivitiesForActor = fetchAvailableActivitiesForActor;
exports.fetchAvailableActivitiesForActorReduced = fetchAvailableActivitiesForActorReduced;
exports.fetchDoneActivitiesForActor = fetchDoneActivitiesForActor;
exports.fetchActivity = fetchActivity;
exports.fetchActivityByActivityManagerId = fetchActivityByActivityManagerId;
exports.commitActivity = commitActivity;
exports.pushActivity = pushActivity;
exports.commitByActivityManagerId = commitByActivityManagerId;
exports.submitByActivityManagerId = submitByActivityManagerId;
const engine_1 = require("../engine");
const logger_1 = require("../utils/logger");
require("../types/express");
function serializeTask(task) {
    return {
        id: task.id,
        state_id: task.process_state_id,
        process_id: task.process_id,
        workflow_id: task.workflow_id,
        created_at: task.created_at,
        type: task.type,
        props: task.props,
        process_status: task.current_status,
        workflow_name: task.workflow_name,
        workflow_description: task.workflow_description,
        node_name: task.blueprint_spec.nodes.find((e) => e.id === task.node_id).name
    };
}
function fetchAvailableActivitiesForActor(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        logger_1.logger.verbose("Called fetchAvailableActivitiesForActor");
        const cockpit = (0, engine_1.getCockpit)();
        const actor_data = (_a = req.state) === null || _a === void 0 ? void 0 : _a.actor_data;
        const query_params = req.query;
        const workflow_id = query_params.workflow_id;
        const filters = workflow_id ? { workflow_id } : {};
        const tasks = yield cockpit.fetchAvailableActivitiesForActor(actor_data, filters);
        res.status(200).json(tasks.map((task) => serializeTask(task)));
        return next();
    });
}
function fetchAvailableActivitiesForActorReduced(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        logger_1.logger.verbose("Called fetchAvailableActivitiesForActor");
        const cockpit = (0, engine_1.getCockpit)();
        const actor_data = (_a = req.state) === null || _a === void 0 ? void 0 : _a.actor_data;
        const query_params = req.query;
        const workflow_id = query_params.workflow_id;
        const filters = workflow_id ? { workflow_id } : {};
        let tasks = yield cockpit.fetchAvailableActivitiesForActor(actor_data, filters);
        tasks = tasks
            .filter((e) => ["finished", "interrupted", "pending"].indexOf(e.process_status) < 0)
            .map((task) => {
            const response = {
                activity_manager_id: task.id,
                process_id: task.process_id,
                workflow_id: task.workflow_id,
                created_at: task.created_at,
                type: task.type,
                workflow_name: task.workflow_name,
                process_status: task.process_status,
                node_name: task.blueprint_spec.nodes.find((e) => e.id === task.node_id).name,
                action: task.props.action
            };
            return response;
        });
        res.status(200).json(tasks);
        return next();
    });
}
function fetchDoneActivitiesForActor(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        logger_1.logger.verbose("Called fetchDoneActivitiesForActor");
        const cockpit = (0, engine_1.getCockpit)();
        const actor_data = (_a = req.state) === null || _a === void 0 ? void 0 : _a.actor_data;
        const query_params = req.query;
        const workflow_id = query_params.workflow_id;
        const filters = workflow_id ? { workflow_id } : {};
        const tasks = yield cockpit.fetchDoneActivitiesForActor(actor_data, filters);
        res.status(200).json(tasks.map((task) => serializeTask(task)));
        return next();
    });
}
function fetchActivity(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        logger_1.logger.verbose("Called fetchActivity");
        const cockpit = (0, engine_1.getCockpit)();
        const actor_data = (_a = req.state) === null || _a === void 0 ? void 0 : _a.actor_data;
        const process_id = req.params.id;
        const process = yield cockpit.fetchProcess(process_id);
        let tasks;
        if (process) {
            switch (process._current_status) {
                case "running":
                case "delegated":
                case "pending":
                case "waiting":
                    tasks = yield cockpit.fetchAvailableActivityForProcess(process_id, actor_data);
                    if (tasks) {
                        res.status(200).json(Object.assign({}, tasks));
                    }
                    else {
                        res.status(204).json({ current_status: process._current_status });
                    }
                    return next();
                default:
                    logger_1.logger.warn(`Inactive status for PID ${process_id}`);
                    res.status(404).json({ current_status: process._current_status });
            }
        }
        else {
            logger_1.logger.warn(`No process found for PID ${process_id}`);
            res.status(404).json({ message: `No process found for PID ${process_id}` });
        }
        return next();
    });
}
function fetchActivityByActivityManagerId(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        logger_1.logger.verbose("Called fetchActivityByActivityManagerId");
        const engine = (0, engine_1.getEngine)();
        const actor_data = (_a = req.state) === null || _a === void 0 ? void 0 : _a.actor_data;
        const activity_manager_id = req.params.id;
        const tasks = yield engine.fetchActivityManager(activity_manager_id, actor_data);
        if (tasks) {
            res.status(200).json(tasks);
        }
        else {
            res.status(404).send();
        }
        return next();
    });
}
function commitActivity(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        logger_1.logger.verbose("Called commitActivity");
        const cockpit = (0, engine_1.getCockpit)();
        const actor_data = (_a = req.state) === null || _a === void 0 ? void 0 : _a.actor_data;
        const process_id = req.params.id;
        const external_input = req.body;
        const tasks = yield cockpit.commitActivity(process_id, actor_data, external_input);
        if (tasks.error) {
            switch (tasks.error.errorType) {
                case "activityManager":
                    res.status(404).json(tasks.error);
                    break;
                case "commitActivity":
                    res.status(400).json(tasks.error);
                    logger_1.logger.info("invalid attempt to commit activity, error: ", tasks.error.message);
                    break;
                default:
                    res.status(500).json(tasks.error);
                    break;
            }
        }
        else {
            res.status(200).json(tasks);
        }
        return next();
    });
}
function pushActivity(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        logger_1.logger.verbose("Called pushActivity");
        const cockpit = (0, engine_1.getCockpit)();
        const actor_data = (_a = req.state) === null || _a === void 0 ? void 0 : _a.actor_data;
        const process_id = req.params.id;
        const response = yield cockpit.pushActivity(process_id, actor_data);
        if (response && !response.error) {
            res.status(202).send();
        }
        else {
            switch (response.error.errorType) {
                case "activityManager":
                    res.status(404).json(response.error);
                    break;
                default:
                    res.status(500).json(response.error);
                    break;
            }
        }
        return next();
    });
}
function commitByActivityManagerId(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        logger_1.logger.verbose("Called commitByActivityManagerId");
        const actor_data = (_a = req.state) === null || _a === void 0 ? void 0 : _a.actor_data;
        const engine = (0, engine_1.getEngine)();
        const activity_manager_id = req.params.id;
        const activity_manager = yield engine.fetchActivityManager(activity_manager_id, actor_data);
        if (activity_manager) {
            logger_1.logger.debug("PID: ", activity_manager.process_id);
            const cockpit = (0, engine_1.getCockpit)();
            const process_id = activity_manager.process_id;
            const external_input = req.body;
            const tasks = yield cockpit.commitActivity(process_id, actor_data, external_input);
            if (tasks.error) {
                switch (tasks.error.errorType) {
                    case "activityManager":
                        res.status(404).json(tasks.error);
                        break;
                    case "commitActivity":
                        res.status(400).json(tasks.error);
                        logger_1.logger.info("invalid attempt to commit activity, error: ", tasks.error.message);
                        break;
                    default:
                        res.status(500).json(tasks.error);
                        break;
                }
            }
            else {
                res.status(200).json(tasks);
            }
        }
        else {
            res.status(404).json({ message: "No activity manager found" });
        }
        return next();
    });
}
function submitByActivityManagerId(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        logger_1.logger.verbose("Called submitByActivityManagerId");
        const actor_data = (_a = req.state) === null || _a === void 0 ? void 0 : _a.actor_data;
        const engine = (0, engine_1.getEngine)();
        const activity_manager_id = req.params.id;
        const external_input = req.body;
        const result = yield engine.submitByActivityManagerId(activity_manager_id, actor_data, external_input);
        if (result && !result.error) {
            res.status(200).json(result);
        }
        else if (result && result.error) {
            res.status(400).json(result.error);
        }
        else {
            res.status(404).json({ message: "No activity manager found" });
        }
        return next();
    });
}
