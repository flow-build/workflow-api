/* eslint-disable no-unused-vars */
exports.up = function (knex, Promise) {
  return knex.schema.createTable("trigger", (table) => {
    table.uuid("id").primary();
    table.timestamp("created_at").notNullable();
    table.boolean("active").notNullable().defaultTo(true);
    table.varchar("signal").notNullable();
    table.uuid("process_id").notNullable();
    table.foreign("process_id").references("process.id");
    table.jsonb("input");
    table.jsonb("actor_data");
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable("trigger");
};
