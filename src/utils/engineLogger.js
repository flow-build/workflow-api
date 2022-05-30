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
      const msg = {
        event,
        message,
        timestamp: new Date(),
      };
    
      mqtt.publishMessage(topic, msg);
    });
  }
  
  emitter.on("PROCESS.START_NODE_RUN", (message) => {
    logLevel = "verbose";
    logMessage = message;
    engineLogger[logLevel](logMessage);
  });

  emitter.on("EXECUTION_LOOP.ROLLBACK", (message) => {
    logLevel = "warn";
    logMessage = message;
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
