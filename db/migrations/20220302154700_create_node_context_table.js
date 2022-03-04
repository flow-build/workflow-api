exports.up = function (knex) {
  return knex.schema.createTable("node_context", (table) => {
    table.uuid("id").primary();
    table.string("code");
    table.timestamp("created_at").notNullable();
    table.string("spec_name");
    table.string("workflow_name");
    table.string("node_id");
    table.jsonb("bag");
    table.jsonb("result");
    table.jsonb("actor_data");
    table.jsonb("environment");
    table.jsonb("parameters");
    table.jsonb("origin_state");
    table.index(["spec_name"], "idx_context_spec_name");
    table.index(["spec_name","workflow_name"], "idx_context_spec_workflow");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("node_context");
};
