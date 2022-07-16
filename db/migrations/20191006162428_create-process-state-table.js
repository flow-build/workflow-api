exports.up = function(knex) {
  return knex.schema.createTable("process_state", table => {
    table.uuid("id").primary();
    table.uuid("process_id").notNullable();
    table.foreign("process_id").references("process.id");
    table.integer("step_number").notNullable();
    table.string("node_id", 255).notNullable();
    table.string("next_node_id");
    table.jsonb("bag").notNullable();
    table.jsonb("external_input");
    table.jsonb("result");
    table.text("error");
    table.string("status").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("process_state");
};
