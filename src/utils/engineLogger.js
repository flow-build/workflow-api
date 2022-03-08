require("dotenv").config();
const { createLogger, format, transports } = require("winston");
const mqtt = require("../services/mqtt");

const engineLogger = createLogger({
  transports: [
    new transports.Console({
      level: process.env.ENGINE_LOG_LEVEL || "info",
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.label({ label: "ENGINE", message: true }),
        format.align(),
        format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
      ),
    }),
  ],
});

const startLogger = () => {
  engineLogger.info("startLogger");

  let logLevel = "silly";
  let logMessage;

  if(process.env.PUBLISH_ENGINE_LOGS) {
    emitter.onAny(function(event, message) {
      const topic = `/logs`;
      const mes = {
        event,
        message,
        timestamp: new Date(),
      };
    
      mqtt.publishMessage(topic, mes);
    });
  }
  
  emitter.on("PROCESS.START_NODE_RUN", (message, variables) => {
    logLevel = "verbose";
    logMessage = message;
    logEvent = [
      {
        process_id: variables.process_id,
        node_type: variables.node_type,
        node_category: variables.node_category,
        node_name: variables.node_name,
        eventType: "start_node_run",
      },
    ];
    engineLogger[logLevel](logMessage);
  });

  emitter.on("EXECUTION_LOOP.ROLLBACK", (message, variables) => {
    logLevel = "warn";
    logMessage = message;
    logMetric = [
      {
        engine_id: variables.engine_id,
        process_id: variables.process_id,
        eventType: "execution_loop_error",
      },
    ];
    engineLogger[logLevel](logMessage);
  });

  emitter.on("ENGINE.CONTRUCTOR", (message) => {
    logLevel = "warn";
    logMessage = message;
    engineLogger[logLevel](logMessage);
  });

};

module.exports = {
  startLogger,
  engineLogger,
};
