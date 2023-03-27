require("dotenv").config();
const { logger } = require("../utils/logger");
const { addSystemTaskCategory } = require("@flowbuild/engine");
const createIndexNode = require("./createIndexNode");
const retrieveProcessNode = require("./retrieveProcessNode");
const tokenizeNode = require("./tokenizeNode");
const validateSchemaNode = require("./validateSchemaNode");
const createUuidNode = require('./createUuidNode');
const BasicAuthNode = require("./basicAuthNode");
const remapDataNode = require('./remapDataNode');
const filterDataNode = require('./filterDataNode');
const DeepCompareNode = require('./deepCompareNode');
const GrpcNode = require("./grpcNode");
const KafkaPublishNode = require("./kafkaPublishNode");

const setCustomNodes = () => {
  addSystemTaskCategory({ createIndex: createIndexNode });
  logger.info("added createIndexNode");
  addSystemTaskCategory({ findProcess: retrieveProcessNode });
  logger.info("added retrieveProcessNode");
  addSystemTaskCategory({ tokenize: tokenizeNode });
  logger.info("added tokenizeNode");
  addSystemTaskCategory({ validateSchema: validateSchemaNode });
  logger.info("added validateSchemaNode");
  addSystemTaskCategory({ createUuid: createUuidNode });
  logger.info("added createUuidNode");
  addSystemTaskCategory({ basicAuth: BasicAuthNode });
  logger.info("added basicAuthNode");
  addSystemTaskCategory({ remapData: remapDataNode });
  logger.info("added remapDataNode");
  addSystemTaskCategory({ filterData: filterDataNode });
  logger.info("added filterDataNode");
  addSystemTaskCategory({ deepCompare: DeepCompareNode });
  logger.info("added deepCompareNode");
  addSystemTaskCategory({ grpc: GrpcNode });
  logger.info("added grpcNode");
  if(process.env.KAFKA) {
    addSystemTaskCategory({ kafkaPublish: KafkaPublishNode });
    logger.info("added kafkaPublishNode");
  }
  
};

module.exports.setCustomNodes = setCustomNodes;
