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
exports.createQueue = createQueue;
const env_1 = require("../../config/env");
const logger_1 = require("../../utils/logger");
const amqplib_1 = __importDefault(require("amqplib"));
let channel;
function connect() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger_1.logger.info(`[services broker rabbitMQ] called connect HOST: ${env_1.envs.MQ.HOST}`);
            const conn = yield amqplib_1.default.connect(`amqp://${env_1.envs.MQ.USERNAME}:${env_1.envs.MQ.PASSWORD}@${env_1.envs.MQ.HOST}`);
            yield createQueue(conn);
            channel = yield conn.createChannel();
            logger_1.logger.info("[services broker rabbitMQ] connected");
        }
        catch (error) {
            logger_1.logger.error(`[services broker rabbitMQ] Error at connect ${JSON.stringify(error)}`);
        }
    });
}
function publishMessage(content) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        logger_1.logger.info("[services broker rabbitMQ] called publishMessage");
        const message = {
            input: Object.assign({ activityManagerId: content === null || content === void 0 ? void 0 : content._id, processId: content === null || content === void 0 ? void 0 : content._process_id }, (_a = content === null || content === void 0 ? void 0 : content._props) === null || _a === void 0 ? void 0 : _a.result),
            action: (_b = content === null || content === void 0 ? void 0 : content._props) === null || _b === void 0 ? void 0 : _b.action,
            schema: content === null || content === void 0 ? void 0 : content._parameters
        };
        if (channel) {
            channel.sendToQueue(env_1.envs.MQ.QUEUE, Buffer.from(JSON.stringify(message)));
            logger_1.logger.info(`[services broker rabbitMQ] message sent`);
        }
        else {
            logger_1.logger.warn("[services broker rabbitMQ] No channel to publish message");
        }
    });
}
function getClient() {
    return channel;
}
function createQueue(conn) {
    return __awaiter(this, void 0, void 0, function* () {
        const channelCreated = yield conn.createChannel();
        yield channelCreated.assertQueue(env_1.envs.MQ.QUEUE, {
            durable: true,
            arguments: {
                "x-queue-type": "classic"
            }
        });
    });
}
