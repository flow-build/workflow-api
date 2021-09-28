const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: process.env.KOA_LOG_LEVEL || "info",
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.label({ label: "KW", message: true }),
    //format.align(),
    format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [new transports.Console()],
  exceptionHandlers: [
    new transports.Console({
      format: format.errors(),
    }),
  ],
  rejectionHandlers: [new transports.Console()],
});

const engineLogger = createLogger({
  transports: [
    new transports.Console({
      level: process.env.KOA_LOG_LEVEL || "info",
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.label({ label: "ENGINE", message: true }),
        format.align(),
        format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
    }),
  ],
});

const startLogger = () => {
  logger.info("startLogger");

  let logLevel = "silly";
  let logMessage;
  let logEvent = [];
  let logMetric;
  /* 
  emitter.onAny((ev, message) => {
    logMessage = `${ev} :: ${message}`
    engineLogger[logLevel](logMessage);
  }); */

  emitter.on("NODE.START_VALIDATED", (message, variables) => {
    logLevel = "verbose";
    logMessage = message;
    if (variables && !variables.is_valid) {
      logEvent = [
        {
          error: variables.error,
          eventType: "invalid_start_data",
        },
      ];
    }
  });

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
  });

  emitter.on("ENGINE.ORPHANS_FETCHED", (message, variables) => {
    logLevel = "warn";
    logMessage = message;

    logMetric = {
      metric: "orphan_processes",
      type: "count",
      value: variables.orphans,
    };
  });
};

module.exports = {
  logger,
  startLogger,
  engineLogger,
};
