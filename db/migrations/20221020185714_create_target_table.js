/* eslint-disable no-unused-vars */
exports.up = function (knex, Promise) {
  return knex.schema.createTable("target", (table) => {
    table.uuid("id").primary();
    table.timestamp("created_at").notNullable();
    table.varchar("signal").notNullable();
    table.varchar("resource_type").notNullable().defaultTo('workflow');
    table.uuid("resource_id").notNullable();
    table.boolean("active").notNullable().defaultTo(true);
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable("target");
};
