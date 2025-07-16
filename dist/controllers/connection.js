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
exports.sendBeacon = sendBeacon;
const env_1 = require("../config/env");
const broker_1 = require("../services/broker");
require("../types/express");
const engine_1 = require("@flowbuild/engine");
function sendBeacon(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        console.log("sendBeacon called");
        const actorId = ((_b = (_a = req.state) === null || _a === void 0 ? void 0 : _a.actor_data) === null || _b === void 0 ? void 0 : _b.actor_id) || "";
        const token = ((_c = req.body) === null || _c === void 0 ? void 0 : _c.token) || "";
        if (actorId) {
            const payload = {
                timestamp: Date.now(),
                engine_id: engine_1.utils.ENGINE_ID,
                mqtt_host: env_1.envs.MQTT.HOST,
                flowbuild_host: env_1.envs.FLOWBUILD.URL,
                token
            };
            const emittedTo = [];
            if (env_1.envs.MQTT) {
                const mqtt_namespace = env_1.envs.MQTT.NAMESPACE;
                const mqttTopic = mqtt_namespace
                    ? `/${mqtt_namespace}/beacon/${actorId}`
                    : `/beacon/${actorId}`;
                yield (0, broker_1.publishMessage)({ topic: mqttTopic, message: payload }, "MQTT");
                emittedTo.push("MQTT");
            }
            if (env_1.envs.KAFKA) {
                const kafka_namespace = env_1.envs.KAFKA.NAMESPACE;
                const kafkaTopic = kafka_namespace
                    ? `${kafka_namespace}.beacon`
                    : `beacon`;
                yield (0, broker_1.publishMessage)({ context: { topic: kafkaTopic, message: payload } }, "KAFKA");
                emittedTo.push("KAFKA");
            }
            if (env_1.envs.MQ.ENABLED) {
                yield (0, broker_1.publishMessage)({ context: { message: payload } }, "AMQP");
                emittedTo.push("AMQP");
            }
            if (!emittedTo.length) {
                res.status(500).json({ message: `No broker is enable on Flowbuild Server` });
                return;
            }
            res.status(200).json({ message: `emitted message to ${emittedTo}` });
            return;
        }
        res.status(400).json({ message: `invalid actor_id` });
        return;
    });
}
