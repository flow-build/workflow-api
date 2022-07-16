exports.up = function(knex) {
  return knex.schema.createTable("packages", table => {
    table.uuid("id").primary();
    table.timestamp("created_at").notNullable();
    table.string("name").notNullable().unique();
    table.string("description").notNullable();
    table.text("code").notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("packages");
};
