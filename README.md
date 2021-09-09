# koa-workflow
## Dependencies:

```
node -v
v14.16.1

npm -v
6.12.0
```

## Environment variables

- JWT_KEY (default = 1234)
- KOA_LOG_LEVEL (default = info)
- ENGINE_LOG_LEVEL (default = error)
- KNEX_END (suggested value = docker)

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

For Windows users, change the `command` in the docker-compose.yml file to:

```
bash -c " npm update && npm install knex -g && npm install nodemon -g && npm install && npm rebuild && npm run migrations && npm run seeds && npm run start "
```

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

## Bibliography

### how to prepare for windows

[how to install docker on windows](https://docs.docker.com/docker-for-windows/install/)
[hot to install wsl2](https://docs.microsoft.com/pt-br/windows/wsl/install-win10)

### how to prepare for linux

[how to install docker on linux distros](https://docs.docker.com/engine/install/)
