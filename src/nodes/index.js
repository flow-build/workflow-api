const { logger } = require("../utils/logger");
const NodeFactory = require("@flowbuild/engine/src/core/utils/node_factory");
const createIndexNode = require("./createIndexNode");
const retrieveProcessNode = require("./retrieveProcessNode");
const tokenizeNode = require("./tokenizeNode");
const validateSchemaNode = require("./validateSchemaNode");
const createUuidNode = require('./createUuidNode');

const setCustomNodes = () => {
  NodeFactory.addSystemTaskCategory({ createIndex: createIndexNode });
  logger.info("added createIndexNode");
  NodeFactory.addSystemTaskCategory({ findProcess: retrieveProcessNode });
  logger.info("added retrieveProcessNode");
  NodeFactory.addSystemTaskCategory({ tokenize: tokenizeNode });
  logger.info("added tokenizeNode");
  NodeFactory.addSystemTaskCategory({ validateSchema: validateSchemaNode });
  logger.info("added validateSchemaNode");
  NodeFactory.addSystemTaskCategory({ createUuid: createUuidNode });
  logger.info("added createUuidNode");
};

module.exports.setCustomNodes = setCustomNodes;
