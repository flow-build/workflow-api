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
exports.savePackage = savePackage;
exports.fetchPackage = fetchPackage;
exports.deletePackage = deletePackage;
const engine_1 = require("../engine");
const logger_1 = require("../utils/logger");
function savePackage(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.debug("called savePackage");
        const cockpit = (0, engine_1.getCockpit)();
        const input_package = req.body;
        try {
            const package_ = yield cockpit.savePackage(input_package.name, input_package.description, input_package.code);
            res.status(201).json({
                package_id: package_.id,
                package_url: `${req.headers.host}${req.baseUrl}/${package_.id}`
            });
        }
        catch (err) {
            res.status(400).json({ error: err });
        }
        return next();
    });
}
function fetchPackage(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.debug("called fetchPackage");
        const cockpit = (0, engine_1.getCockpit)();
        const package_id = req.params.id;
        const package_ = yield cockpit.fetchPackage(package_id);
        if (package_) {
            res.status(200).json(package_.serialize());
        }
        else {
            res.status(404).end();
        }
        return next();
    });
}
function deletePackage(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.debug("called deletePackage");
        const cockpit = (0, engine_1.getCockpit)();
        const package_id = req.params.id;
        const num_deleted = yield cockpit.deletePackage(package_id);
        if (num_deleted === 0) {
            res.status(404).end();
        }
        else {
            res.status(202).json({
                deleted: num_deleted
            });
        }
        return next();
    });
}
