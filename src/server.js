require("dotenv").config();
require('newrelic');
require("./utils/tracing");

const { startServer } = require("./app");

const port = process.env.PORT || 3000;

const server = startServer(port);

module.exports = server;
