exports.up = function(knex) {
  return knex.schema.createTable("process", table => {
    table.uuid("id").primary();
    table.uuid("workflow_id").notNullable();
    table.foreign("workflow_id").references("workflow.id");
    table.jsonb("blueprint_spec").notNullable();
    table.timestamp("created_at").notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("process");
};
