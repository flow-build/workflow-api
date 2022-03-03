exports.up = function (knex) {
  return knex.schema.createTable("node_context", (table) => {
    table.uuid("id").primary();
    table.timestamp("created_at").notNullable();
    table.uuid("spec_id").references("node_spec.id");
    table.string("workflow_name");
    table.string("node_id");
    table.jsonb("bag");
    table.jsonb("result");
    table.jsonb("actor_data");
    table.jsonb("environment");
    table.jsonb("parameters");
    table.index(["spec_id"], "idx_context_spec_id");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("node_context");
};
