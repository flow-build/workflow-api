const { NodeSDK } = require("@opentelemetry/sdk-node");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { BasicTracerProvider, SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { OTLPTraceExporter } =  require('@opentelemetry/exporter-trace-otlp-grpc');
const grpc = require('@grpc/grpc-js');
const { logger } = require('./logger');

const openTelemetry = process.env.OTEL_ENABLED

const metadata = new grpc.Metadata();
const collectorOptions = {}

if(openTelemetry === true) {
  if(process.env.NEW_RELIC_ENABLED === true) {
    logger.info("Enabling New Relic")
    metadata.set('api-key', process.env.NEW_RELIC_API_KEY )  
    collectorOptions.metadata = metadata;
    collectorOptions.credentials = grpc.credentials.createSsl()
  }
  //http://localhost:4317 is the default value for the otlp grpc package'
  collectorOptions.url = process.env.OTEL_COLLECTOR_URL || 'http://localhost:4317';
}


const exporter = new OTLPTraceExporter(collectorOptions);

const provider = new BasicTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME
  })
});
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

const sdk = new NodeSDK({
  traceExporter: exporter,
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: "flowbuild-local"
});

if(openTelemetry === true) {
  sdk.start().then(() => {
    logger.info("Open Telemetry Started")
    logger.info(`Service Name: ${process.env.OTEL_SERVICE_NAME}`)
  })  

  provider.register();
  ['SIGINT', 'SIGTERM'].forEach(signal => {
    logger.info(`Open Telemetry Provider ${signal}`)
    process.on(signal, () => provider.shutdown().catch(console.error));
  }); 
} else {
  logger.info("Open Telemetry Disabled")
}

