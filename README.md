# koa-workflow

## Dependencies:

```
node -v
v12.13.0 (lts/dubnium)

npm -v
6.12.0
```
## Run the project on docker:

To run docker, just run `docker-compose up` and the start_dev script will run the server.

Make sure ports 3000 and 5432 are free to use on your localhost.

To run the tests, you may use the command below:

```
docker-compose run -T app ./scripts/run_tests.sh
```
