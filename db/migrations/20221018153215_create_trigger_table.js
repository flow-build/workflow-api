/* eslint-disable no-unused-vars */
exports.up = function (knex) {
  return knex.schema.createTable("trigger", (table) => {
    table.uuid("id").primary();
    table.timestamp("created_at").notNullable();
    table.boolean("active").notNullable().defaultTo(true);
    table.varchar("signal").notNullable();
    table.uuid("process_id").notNullable();
    table.jsonb("input");
    table.jsonb("actor_data");
  });
};
  
exports.down = function (knex) {
  return knex.schema.dropTable("trigger");
};
  