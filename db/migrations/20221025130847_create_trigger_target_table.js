/* eslint-disable no-unused-vars */

exports.up = function (knex) {
  return knex.schema.createTable("trigger_target", (table) => {
    table.uuid("id").primary();
    table.uuid("trigger_id").notNullable();
    table.foreign("trigger_id").references("trigger.id");
    table.uuid("target_id").notNullable();
    table.foreign("target_id").references("target.id");
    table.varchar("target_process_id");
    table.boolean("resolved");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("trigger_target");
};
