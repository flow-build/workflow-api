# koa-workflow

## Dependencies:

```
node -v
v12.13.0 (lts/dubnium)

npm -v
6.12.0
```

## Environment variables

To change the JWT secret (default is "1234"), put in the .env (or .env.docker if using docker):

```
JWT_KEY=newsecret
```

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

Para usuários Windows, altere o command do arquivo docker-compose.yml para 

```
bash -c " npm update && npm install knex -g && npm install nodemon -g && npm install && npm rebuild && npm run migrations && npm run seeds && npm run start "
```

## Bibliography

### how to prepare for windows

[how to install docker on windows](https://docs.docker.com/docker-for-windows/install/)
[hot to install wsl2](https://docs.microsoft.com/pt-br/windows/wsl/install-win10)

### how to prepare for linux

[how to install docker on linux distros](https://docs.docker.com/engine/install/)
