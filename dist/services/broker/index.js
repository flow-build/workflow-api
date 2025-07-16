"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const env_1 = require("../../config/env");
const kafka = __importStar(require("./kafka"));
const mqtt = __importStar(require("./mqtt"));
const rabbitMQ = __importStar(require("./rabbitMQ"));
function connect() {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.env.MQTT === "true") {
            yield mqtt.connect();
        }
        if (process.env.AMQP === "true") {
            yield rabbitMQ.connect();
        }
        if (process.env.KAFKA === "true") {
            yield kafka.connect();
        }
    });
}
function publishMessage(payload, broker) {
    return __awaiter(this, void 0, void 0, function* () {
        if (env_1.envs.FLOWBUILD.EVENTS.BROKER === "MQTT") {
            yield mqtt.publishMessage({ topic: payload.topic, message: payload.message });
        }
        else if (process.env.AMQP === "true" && broker === "AMQP") {
            yield rabbitMQ.publishMessage(payload.context);
        }
        else if (process.env.KAFKA === "true" && broker === "KAFKA") {
            yield kafka.publishMessage(payload.context);
        }
    });
}
function getClient() {
    if (env_1.envs.FLOWBUILD.EVENTS.BROKER === "MQTT") {
        return mqtt.getClient();
    }
    else if (env_1.envs.MQ.ENABLED && env_1.envs.FLOWBUILD.EVENTS.BROKER === "AMQP") {
        return rabbitMQ.getClient();
    }
    else if (env_1.envs.KAFKA && env_1.envs.FLOWBUILD.EVENTS.BROKER === "KAFKA") {
        return kafka.getClient();
    }
}
