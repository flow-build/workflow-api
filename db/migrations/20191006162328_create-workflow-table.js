exports.up = function(knex) {
  return knex.schema.createTable("workflow", table => {
    table.uuid("id").primary();
    table.string("name", 255).notNullable();
    table.text("description").notNullable();
    table.jsonb("blueprint_spec").notNullable();
    table.integer("version").notNullable();
    table.timestamp("created_at").notNullable();
    table.unique(["name", "version"]);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("workflow");
};
