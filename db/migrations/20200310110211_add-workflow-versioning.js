
exports.up = function (knex) {
    return knex.schema.table('workflow', function (table) {
        table.dropUnique('name');
        table.integer('version').notNullable();
        table.unique(['name', 'version']);
    });
};

exports.down = function (knex) {
    return knex.schema.table('workflow', function (table) {
        table.dropUnique(['name', 'version']);
        table.dropColumn('version');
        table.unique('name');
    });
};
