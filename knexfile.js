const path = require('path');
const BASE_PATH = __dirname;

module.exports = {
  test: {
    client: 'pg',
    connection: {
      host: "127.0.0.1",
      user: "postgres",
      password: "postgres",
      database: "koa_workflow"
    },
    migrations: {
      directory: path.join(BASE_PATH, 'db/migrations')
    },
    seeds: {
      directory: path.join(BASE_PATH, 'db/seeds')
    }
  },
  docker: {
    client: 'pg',
    connection: {
      host: "koa-workflow_postgres",
      user: "postgres",
      password: "postgres",
      database: "workflow"
    },
    migrations: {
      directory: path.join(BASE_PATH, 'db/migrations')
    },
    seeds: {
      directory: path.join(BASE_PATH, 'db/seeds')
    }
  }
}
