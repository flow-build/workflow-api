# Workflow API

## Dependencies:

```
node -v
v18.12

npm -v
9.2.0
```

## Environment variables

Add a .env file with the following variables:

- NODE_ENV (suggested value = docker)
- KOA_LOG_LEVEL (error, warn, _info_, http, verbose, debug, silly)
- PORT (default=_3000_)

### DATABASE CONNECTION

- KNEX_ENV (text, docker, dockerLocal, _prod_)
- POSTGRES_PORT
- POSTGRES_HOST
- POSTGRES_DATABASE
- POSTGRES_USER
- POSTGRES_PASSWORD

### TOKEN CONFIGURATION

The default configuration is set to use a own generated JWT token.
If an external token is to be used, the JWT\_ variables need to be passed.

- JWT_KEY (default=_1234_)
- JWT_ALG (default=_HS256_, if set to RS256, the application will convert the JWT_KEY to a public certificate.)
- JWT_PASSTHROUGH (boolean, default=_true_)
- JWT*EXTRA_KEYS (\_optional*, defines extra properties from token payload that should be sent to process' actor_data)
- JWT_PATH_ACTOR_ID (default=_actor_id_, specifies the path to the actor id in the token payload)
- JWT_PATH_CLAIMS (default=_claims_. Claims value should always be an array)
- JWT*PATH_SESSION_ID (\_optional*, default=_session_id_)

### MQTT CONFIGURATION

- MQTT (bool)
- MQTT_HOST
- MQTT_PORT
- MQTT_PATH
- MQTT_PROTOCOL
- MQTT*USERNAME (\_optional*, required for wss connections)
- MQTT*PASSWORD (\_optional*, required for wss connections)
- MQTT_NAMESPACE (if present, this string will the prepended to any topic published)

### AMQP CONFIGURATION

- AMQP (bool)
- BROKER_HOST
- BROKER_QUEUE
- BROKER_USERNAME
- BROKER_PASSWORD

### KAFKA CONFIGURATION

- KAFKA (bool)
- KAFKA_BOOTSTRAP_SERVER
- KAFKA_SEC_PROTOCOL
- KAFKA_SASL_MECHANISMS
- KAFKA_CLUSTER_API_KEY
- KAFKA_API_SECRET
- KAFKA_SESSION_TIMEOUT

### EVENT Nodes CONFIGURATION (also WEM CONFIGURATION)

- WORKFLOW_EVENTS_BROKER (Values: KAFKA|MQTT|AMQP. If not defined, it won't send)
- WORKFLOW_EVENTS_NAMESPACE

### CHOOSING BROKERS TO USE (AMQP OR MQTT)

- ACTIVITY_MANAGER_BROKER
- PROCESS_STATE_BROKER
- ENGINE_LOGS_BROKER

### ACTIVITY_MANAGER CONFIGURATION

- ACTIVITY_MANAGER_SEND_ONLY_ON_CREATION (bool)

### ENGINE CONFIGURATION

- ENGINE_LOG_LEVEL (default=_error_)
- ENGINE_HEARTBEAT (_true_/false string, turns on-off engine heartbeat)
- HEART_BEAT (integer, default=1000, interval between beats in ms)
- PUBLISH_STATE_EVENTS (_true_/false string, enables states to be published to message broker)
- PUBLISH_ENGINE_LOGS (_true_/false string, enables engine logs to be published to message broker)
- PUBLISH_SERVER_LOGS (_true_/false string, enables api logs to be published to message broker)
- MAX_STEP_NUMBER (integer, maximum number of steps for a process)
- MAX_CONTENT_LENGTH (integer, max content length for response on http node calls)
- MAX_BODY_LENGTH (integer, max body length for response on BasicAuth nodes)
- HTTP_TIMEOUT (integer, timeout in ms for BasicAuth nodes)
- TIMER_BATCH (integer, default=_40_)
- ORPHAN_BATCH (integer, default=_40_)

#### TIMER CONFIGURATION

Timer management can be handled outside the heartbeat, by a external Timer Worker running timers using an Redis Queue using bullMQ.
To enable this option, the engine must be configured to publish timers on the queue thru 3 variables that configures the bullMQ.

- TIMER_QUEUE (string)
- TIMER_HOST (URL)
- TIMER_PORT

### HEALTHCHECK

Healthcheck route (GET / or GET /healthcheck), by default, checks the router and db connection.
The server can be configured to evaluate the number of ready timers (timers expired but not yet triggered) to access engine health.
This setting should not be enabled if the timers area being handled by the timer worker.

- MAX*READY_TIMERS (\_optional*, integer, defines the amount of ready timers before the server is declared unhealthy)

### MONITORING

- OTEL_ENABLED (bool, activates Open Telemetry config)
- OTEL_SERVICE_NAME (string)
- OTEL_COLLECTOR_URL

#### NEW RELIC CONFIGURATION

- NEW_RELIC_ENABLED (bool, activates New Relic config for direct or OTEL Monitoring.)
- NEW_RELIC_API_KEY (required if New Relic is enabled)
- NEW_RELIC_NO_CONFIG_FILE (recommended=_true_)
- NEW_RELIC_LOG (recommended=_stdout_)
- NEW_RELIC_LOG_ENABLED (recommended=_true_)
- NEW_RELIC_LOG_LEVEL (recommended=_info_)
- NEW_RELIC_DISTRIBUTEC_TRACING_ENABLED (recommended=_true_)
- NEW_RELIC_APPLICATION_LOGGING_ENABLED (recommended=_true_)
- NEW_RELIC_APP_NAME

### POSTMAN

For Newman test runs

- POSTMAN_API_KEY
- POSTMAN_TEST_COLLECTION
- POSTMAN_ENVIRONMENT

## Run the project on docker:

To run docker, just run

```
docker-compose up
```

Make sure ports 3000 and 5432 are free to use on your localhost.

To run the tests, you may use the command below:

```
docker-compose run -T app ./scripts/run_tests.sh
```

For Windows users, comment the script command from the docker-compose.yml and use the bash one.

## Exploring and executing the API

To explore all possible routes, go to http://localhost:3000/swagger

If you change the base url, change it as well in the openapi3.yaml file.

If you wish to use a third-party program, such as Insomnia or Postman, just import the openapi3.yaml file and all the routes will be shown. If you use Postman, I would recommend changing the Folder organization to Tags after selecting the file to be imported.

## Logging

There are 2 sources of logs: engine and the API itself. Both uses winston library to manage formats and transports.

The events emitted by the engine can by logged by the engine itself or managed by the API app.

You can set the log level from the engine using the ENGINE_LOG_LEVEL variable. At the time you cannot turn them completely off.

The log levels use the scale below:

silly -> debug -> verbose -> http -> info -> warn -> error

The API app uses the same log levels, but they are managed by the KOA_LOG_LEVEL variable and has a default value of info.

Notice that at default configuration, error events are logged twice.

Engine events will also be sent to a `/logs` topic to mqtt if the both MQTT and PUBLISH_ENGINE_LOGS are set to true.

## MQTT

The default compose will set up a postgres database, an hive MQTT server and the app itself.

During app initialization, is the MQTT is true, the flowbuild will try to connect to the MQTT server.

Be sure to provide the following parameters as environment variables

- MQTT_HOST (`localhost` if you a running on docker)
- MQTT_PORT (8000)
- MQTT_PATH (/mqtt)

The following topics will be used:

- `/logs` for engine logs
- `/process/:processId/state` for each process state created
- `/process/:processId/am/create` for each activity_manager created
- `/actor/:actorId/am/create` for each activity_manager created, if an actor_id property exists in activity_manager input
- `/session/:sessionId/am/create` for each activity_manager created, if an session_id property exists in activity_manager input

## Tests

You can run unit tests by running `npm run tests`.

If you would like to test the routes itself, you can use Newman to do that, by running the command.

```bash
newman run postman \newman\tests.postman_collection.json -e postman\newman\local_environment.json
```

## Bibliography

### how to prepare for windows

[how to install docker on windows](https://docs.docker.com/docker-for-windows/install/)
[hot to install wsl2](https://docs.microsoft.com/pt-br/windows/wsl/install-win10)

### how to prepare for linux

[how to install docker on linux distros](https://docs.docker.com/engine/install/)
