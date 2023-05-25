exports.up = function (knex) {
  return knex.schema.createTable("environment_variable", (table) => {
    table.string("key").primary();
    table.string("value").notNullable();
    table.string("type").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("environment_variable");
};
