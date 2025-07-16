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
exports.fetchWorkflowsWithProcessStatusCount = fetchWorkflowsWithProcessStatusCount;
const engine_1 = require("../../engine");
const logger_1 = require("../../utils/logger");
require("../../types/express");
const uuid_1 = require("uuid");
function fetchWorkflowsWithProcessStatusCount(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose("[controllers cockpit workflow] called fetchWorkflowsWithProcessStatusCount");
        const cockpit = (0, engine_1.getCockpit)();
        const filters = req.query;
        let is_valid = true;
        if (filters.workflow_id) {
            logger_1.logger.debug("validating workflow_id");
            is_valid = (0, uuid_1.validate)(filters.workflow_id);
        }
        if (!is_valid) {
            res.status(400).json({ message: "Invalid uuid" });
        }
        else {
            const workflows = yield cockpit.fetchWorkflowsWithProcessStatusCount(filters);
            res.status(200).json({ workflows });
        }
        return next();
    });
}
