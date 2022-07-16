exports.up = function(knex) {
  return knex.schema.createTable("activity_manager", table => {
    table.uuid("id").primary();
    table.timestamp("created_at").notNullable();
    table.string("type").notNullable();
    table.uuid("process_state_id").notNullable();
    table.foreign("process_state_id").references("process_state.id");
    table.jsonb("props").notNullable();
    table.jsonb("parameters").notNullable();
    table.string("status").notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("activity_manager");
};
