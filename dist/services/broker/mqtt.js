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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = connect;
exports.publishMessage = publishMessage;
exports.getClient = getClient;
const env_1 = require("../../config/env");
const logger_1 = require("../../utils/logger");
const async_mqtt_1 = __importDefault(require("async-mqtt"));
const nanoid_1 = require("nanoid");
let client;
function connect() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger_1.logger.info("[services broker mqtt] connect to MQTT Broker");
            const clientId = `flowBuild_${(0, nanoid_1.nanoid)(10)}`;
            logger_1.logger.info(`[services broker mqtt] host: ${env_1.envs.MQTT.HOST}, client: ${clientId}, protocol: ${process.env.MQTT_PROTOCOL}`);
            client = async_mqtt_1.default.connect({
                hostname: env_1.envs.MQTT.HOST,
                port: env_1.envs.MQTT.PORT,
                protocol: env_1.envs.MQTT.PROTOCOL,
                path: env_1.envs.MQTT.PATH,
                clientId: clientId,
                username: env_1.envs.MQTT.USERNAME,
                password: env_1.envs.MQTT.PASSWORD
            });
            logger_1.logger.info("[services broker mqtt] connected to MQTT Broker");
        }
        catch (error) {
            logger_1.logger.error(error);
        }
    });
}
function publishMessage(input) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.info(`[services broker mqtt] called publishMessage, topic: ${input.topic}`);
        if (client) {
            yield client.publish(input.topic, JSON.stringify(input.message), { qos: 1 });
            logger_1.logger.verbose(`[services broker mqtt] message published`);
        }
        else {
            logger_1.logger.warn("[services broker mqtt] No client");
        }
    });
}
function getClient() {
    return client;
}
