import { envs } from "../config/env"

import { logger } from "./logger"

import grpc from "@grpc/grpc-js"
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc"
import { Resource } from "@opentelemetry/resources"
import { NodeSDK } from "@opentelemetry/sdk-node"
import { BasicTracerProvider, SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base"
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions"

const openTelemetry = envs.OTEL.ENABLED

const metadata = new grpc.Metadata()
const collectorOptions: Record<string, any> = {}

if (openTelemetry) {
  if (envs.NEW_RELIC.ENABLED) {
    logger.info("Enabling New Relic")
    metadata.set("api-key", envs.NEW_RELIC.API_KEY)
    collectorOptions.metadata = metadata
    collectorOptions.credentials = grpc.credentials.createSsl()
  }
  // http://localhost:4317 is the default value for the otlp grpc package'
  collectorOptions.url = envs.OTEL.URL
}

const exporter = new OTLPTraceExporter(collectorOptions)

const provider = new BasicTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: envs.OTEL.SERVICE_NAME
  })
})
provider.addSpanProcessor(new SimpleSpanProcessor(exporter))

const sdk = new NodeSDK({
  traceExporter: exporter,
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: "flowbuild-local"
})

if (openTelemetry) {
  sdk.start()
  logger.info("Open Telemetry Started")
  logger.info(`Service Name: ${envs.OTEL.SERVICE_NAME}`)
  provider.register();
  ["SIGINT", "SIGTERM"].forEach((signal) => {
    logger.info(`Open Telemetry Provider ${signal}`)
    process.on(signal, () => provider.shutdown().catch(console.error))
  })
}
else {
  logger.info("Open Telemetry Disabled")
}
