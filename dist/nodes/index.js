"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCustomNodes = void 0;
const logger_1 = require("../utils/logger");
const basicAuthNode_1 = __importDefault(require("./basicAuthNode"));
const createIndexNode_1 = __importDefault(require("./createIndexNode"));
const createUuidNode_1 = __importDefault(require("./createUuidNode"));
const deepCompareNode_1 = __importDefault(require("./deepCompareNode"));
const filterDataNode_1 = __importDefault(require("./filterDataNode"));
const graphqlNode_1 = __importDefault(require("./graphqlNode"));
const grpcNode_1 = __importDefault(require("./grpcNode"));
const kafkaPublishNode_1 = __importDefault(require("./kafkaPublishNode"));
const remapDataNode_1 = __importDefault(require("./remapDataNode"));
const retrieveProcessNode_1 = __importDefault(require("./retrieveProcessNode"));
const tokenizeNode_1 = __importDefault(require("./tokenizeNode"));
const validateSchemaNode_1 = __importDefault(require("./validateSchemaNode"));
const engine_1 = require("@flowbuild/engine");
const setCustomNodes = () => {
    (0, engine_1.addSystemTaskCategory)({ createIndex: createIndexNode_1.default });
    logger_1.logger.info("added createIndexNode");
    (0, engine_1.addSystemTaskCategory)({ findProcess: retrieveProcessNode_1.default });
    logger_1.logger.info("added retrieveProcessNode");
    (0, engine_1.addSystemTaskCategory)({ tokenize: tokenizeNode_1.default });
    logger_1.logger.info("added tokenizeNode");
    (0, engine_1.addSystemTaskCategory)({ validateSchema: validateSchemaNode_1.default });
    logger_1.logger.info("added validateSchemaNode");
    (0, engine_1.addSystemTaskCategory)({ createUuid: createUuidNode_1.default });
    logger_1.logger.info("added createUuidNode");
    (0, engine_1.addSystemTaskCategory)({ basicAuth: basicAuthNode_1.default });
    logger_1.logger.info("added basicAuthNode");
    (0, engine_1.addSystemTaskCategory)({ remapData: remapDataNode_1.default });
    logger_1.logger.info("added remapDataNode");
    (0, engine_1.addSystemTaskCategory)({ filterData: filterDataNode_1.default });
    logger_1.logger.info("added filterDataNode");
    (0, engine_1.addSystemTaskCategory)({ deepCompare: deepCompareNode_1.default });
    logger_1.logger.info("added deepCompareNode");
    (0, engine_1.addSystemTaskCategory)({ grpc: grpcNode_1.default });
    logger_1.logger.info("added grpcNode");
    if (process.env.KAFKA) {
        (0, engine_1.addSystemTaskCategory)({ kafkaPublish: kafkaPublishNode_1.default });
        logger_1.logger.info("added kafkaPublishNode");
    }
    (0, engine_1.addSystemTaskCategory)({ graphQl: graphqlNode_1.default });
    logger_1.logger.info("added graphQlNode");
};
exports.setCustomNodes = setCustomNodes;
