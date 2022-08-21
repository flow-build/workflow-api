exports.up = function (knex) {
  return knex.schema.createTable("timer", (table) => {
    table.uuid("id").primary();
    table.timestamp("created_at").notNullable();
    table.timestamp("expires_at", (options = { useTz: false })).notNullable();
    table.boolean("active").notNullable().defaultTo(false);
    table.string("resource_type").notNullable();
    table.uuid("resource_id").notNullable();
    table.jsonb("params");
    table.timestamp("fired_at", (options = { useTz: false }));
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("timer");
};
