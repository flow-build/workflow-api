const { logger } = require("../utils/logger");
const NodeFactory = require("@flowbuild/engine/src/core/utils/node_factory");
const createIndexNode = require("./createIndexNode");
const retrieveProcessNode = require("./retrieveProcessNode");

const setCustomNodes = () => {
  NodeFactory.addSystemTaskCategory({ createIndex: createIndexNode });
  logger.info("added createIndexNode");
  NodeFactory.addSystemTaskCategory({ findProcess: retrieveProcessNode });
  logger.info("added retrieveProcessNode");
};

module.exports.setCustomNodes = setCustomNodes;
