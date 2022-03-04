exports.up = function (knex) {
  return knex.schema.createTable("node_spec", (table) => {
    table.uuid("id").primary();
    table.string("code");
    table.timestamp("created_at").notNullable();
    table.string("name");
    table.string("element_type");
    table.string("node_lane_id");
    table.string("node_name");
    table.string("node_type");
    table.string("node_category");
    table.jsonb("node_parameters");
    table.uuid("compose_spec_id").references("node_spec.id");
    table.index(["node_type"], "idx_spec_node_type");
    table.index(["node_category"], "idx_spec_node_category");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("node_spec");
};
