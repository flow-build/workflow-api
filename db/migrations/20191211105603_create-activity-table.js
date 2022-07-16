exports.up = function (knex) {
  return knex.schema.createTable("activity", (table) => {
    table.uuid("id").primary();
    table.timestamp("created_at").notNullable();
    table.uuid("activity_manager_id").notNullable();
    table.foreign("activity_manager_id").references("activity_manager.id");
    table.jsonb("actor_data").notNullable();
    table.jsonb("data").notNullable();
    table.string("status").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("activity");
};
