"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("../config/env");
const logger_1 = require("./logger");
const grpc_js_1 = __importDefault(require("@grpc/grpc-js"));
const auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
const exporter_trace_otlp_grpc_1 = require("@opentelemetry/exporter-trace-otlp-grpc");
const resources_1 = require("@opentelemetry/resources");
const sdk_node_1 = require("@opentelemetry/sdk-node");
const sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
const openTelemetry = env_1.envs.OTEL.ENABLED;
const metadata = new grpc_js_1.default.Metadata();
const collectorOptions = {};
if (openTelemetry) {
    if (env_1.envs.NEW_RELIC.ENABLED) {
        logger_1.logger.info("Enabling New Relic");
        metadata.set("api-key", env_1.envs.NEW_RELIC.API_KEY);
        collectorOptions.metadata = metadata;
        collectorOptions.credentials = grpc_js_1.default.credentials.createSsl();
    }
    collectorOptions.url = env_1.envs.OTEL.URL;
}
const exporter = new exporter_trace_otlp_grpc_1.OTLPTraceExporter(collectorOptions);
const provider = new sdk_trace_base_1.BasicTracerProvider({
    resource: new resources_1.Resource({
        [semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME]: env_1.envs.OTEL.SERVICE_NAME
    })
});
provider.addSpanProcessor(new sdk_trace_base_1.SimpleSpanProcessor(exporter));
const sdk = new sdk_node_1.NodeSDK({
    traceExporter: exporter,
    instrumentations: [(0, auto_instrumentations_node_1.getNodeAutoInstrumentations)()],
    serviceName: "flowbuild-local"
});
if (openTelemetry) {
    sdk.start();
    logger_1.logger.info("Open Telemetry Started");
    logger_1.logger.info(`Service Name: ${env_1.envs.OTEL.SERVICE_NAME}`);
    provider.register();
    ["SIGINT", "SIGTERM"].forEach((signal) => {
        logger_1.logger.info(`Open Telemetry Provider ${signal}`);
        process.on(signal, () => provider.shutdown().catch(console.error));
    });
}
else {
    logger_1.logger.info("Open Telemetry Disabled");
}
