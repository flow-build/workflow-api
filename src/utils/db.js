require('dotenv').config();
const knex = require("knex");
const knexConfig = require("../../knexfile");

const _config = knexConfig[process.env.KNEX_ENV || "test"];

module.exports = {
  db_config: _config,
  db: knex(_config)
};
