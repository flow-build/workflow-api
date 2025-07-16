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
exports.expire = expire;
const engine_1 = require("../../engine");
const logger_1 = require("../../utils/logger");
require("../../types/express");
function expire(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        logger_1.logger.verbose("Cockpit ActivityManager expire");
        const amid = req.params.id;
        const actor_data = (_a = req.state) === null || _a === void 0 ? void 0 : _a.actor_data;
        const engine = (0, engine_1.getEngine)();
        const am = yield engine.fetchActivityManager(amid, actor_data);
        if (!am) {
            res.status(404).json({ message: "activity manager not found" });
            return next();
        }
        if (["completed", "interrupted"].includes(am.activity_status)) {
            res.status(409).json({
                message: "activity manager cannot be expired",
                current_status: am.activity_status
            });
            return next();
        }
        const cockpit = (0, engine_1.getCockpit)();
        try {
            yield cockpit.expireActivityManager(amid, actor_data);
            res.status(200).json({
                message: "Expire command submitted, check process history for current status"
            });
        }
        catch (e) {
            res.status(400).json({ message: `Failed at ${e.message}`, error: e });
        }
        return next();
    });
}
