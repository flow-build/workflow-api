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
exports.connect = connect;
exports.publishMessage = publishMessage;
exports.getClient = getClient;
exports.disconnect = disconnect;
const env_1 = require("../../config/env");
const logger_1 = require("../../utils/logger");
const kafkajs_1 = require("kafkajs");
const sasl = {
    mechanism: "plain",
    username: env_1.envs.KAFKA.API_KEY,
    password: env_1.envs.KAFKA.API_SECRET
};
const ssl = !!sasl;
let client;
function connect() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger_1.logger.info("trying to connect to Kafka");
            const kafka = new kafkajs_1.Kafka({
                clientId: "flowbuild",
                brokers: [env_1.envs.KAFKA.BOOTSTRAP_SERVER],
                ssl,
                sasl
            });
            client = kafka.producer();
            yield client.connect();
        }
        catch (error) {
            logger_1.logger.error(error);
        }
    });
}
function publishMessage(input) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.info(`[services broker kafka] publishMessage to topic ${input.topic}`);
        if (!client) {
            logger_1.logger.warn("[services broker kafka] No client");
            return;
        }
        const messageBuf = Buffer.from(JSON.stringify(input.message));
        yield client.send({
            topic: input.topic,
            messages: [
                {
                    key: input.key,
                    value: messageBuf,
                    timestamp: Date.now().toString()
                }
            ]
        });
    });
}
function getClient() {
    return client;
}
function disconnect() {
    return __awaiter(this, void 0, void 0, function* () {
        if (client) {
            yield client.disconnect();
        }
    });
}
