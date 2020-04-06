
exports.up = function (knex) {
    return knex.schema.table("activity_manager", table => {
        table.string("type").notNullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table("activity_manager", table => {
        table.dropColumn("type");
    });
};
