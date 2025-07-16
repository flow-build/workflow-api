import { logger } from "../utils/logger"

import BasicAuthNode from "./basicAuthNode"
import createIndexNode from "./createIndexNode"
import createUuidNode from "./createUuidNode"
import DeepCompareNode from "./deepCompareNode"
import filterDataNode from "./filterDataNode"
import GraphQlNode from "./graphqlNode"
import GrpcNode from "./grpcNode"
import KafkaPublishNode from "./kafkaPublishNode"
import remapDataNode from "./remapDataNode"
import retrieveProcessNode from "./retrieveProcessNode"
import tokenizeNode from "./tokenizeNode"
import validateSchemaNode from "./validateSchemaNode"

import { addSystemTaskCategory } from "@flowbuild/engine"

export const setCustomNodes = (): void => {
  addSystemTaskCategory({ createIndex: createIndexNode })
  logger.info("added createIndexNode")
  addSystemTaskCategory({ findProcess: retrieveProcessNode })
  logger.info("added retrieveProcessNode")
  addSystemTaskCategory({ tokenize: tokenizeNode })
  logger.info("added tokenizeNode")
  addSystemTaskCategory({ validateSchema: validateSchemaNode })
  logger.info("added validateSchemaNode")
  addSystemTaskCategory({ createUuid: createUuidNode })
  logger.info("added createUuidNode")
  addSystemTaskCategory({ basicAuth: BasicAuthNode })
  logger.info("added basicAuthNode")
  addSystemTaskCategory({ remapData: remapDataNode })
  logger.info("added remapDataNode")
  addSystemTaskCategory({ filterData: filterDataNode })
  logger.info("added filterDataNode")
  addSystemTaskCategory({ deepCompare: DeepCompareNode })
  logger.info("added deepCompareNode")
  addSystemTaskCategory({ grpc: GrpcNode })
  logger.info("added grpcNode")
  if (process.env.KAFKA) {
    addSystemTaskCategory({ kafkaPublish: KafkaPublishNode })
    logger.info("added kafkaPublishNode")
  }
  addSystemTaskCategory({ graphQl: GraphQlNode })
  logger.info("added graphQlNode")
}
