const { logger } = require("../utils/logger");
const { addSystemTaskCategory } = require("@flowbuild/engine");
const createIndexNode = require("./createIndexNode");
const retrieveProcessNode = require("./retrieveProcessNode");
const tokenizeNode = require("./tokenizeNode");
const validateSchemaNode = require("./validateSchemaNode");
const createUuidNode = require('./createUuidNode');
const BasicAuthNode = require("./basicAuthNode");
const remapDataNode = require('./remapDataNode');
const DeepCompareNode = require('./deepCompareNode');
const GrpcNode = require("./grpcNode")

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
  addSystemTaskCategory({ deepCompare: DeepCompareNode });
  logger.info("added deepCompareNode");
  addSystemTaskCategory({ grpc: GrpcNode });
  logger.info("added grpcNode");
};

module.exports.setCustomNodes = setCustomNodes;
