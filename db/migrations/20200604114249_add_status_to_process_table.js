exports.up = function (knex) {
  return knex.schema.alterTable("process", (table) => {
    table.string("current_status");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("process", (table) => {
    table.dropColumn("current_status");
  });
};
