exports.up = function(knex, Promise) {
    return knex.schema.createTable("schemas", table => {
        table.uuid("id").primary();
        table.timestamp("created_at").notNullable();
        table.string("resource_type").notNullable();
        table.string("attribute");
        table.jsonb("params");
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable("schemas");
};