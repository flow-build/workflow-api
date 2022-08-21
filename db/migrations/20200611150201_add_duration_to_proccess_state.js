exports.up = function (knex) {
  return knex.schema.alterTable("process_state", (table) => {
    table.bigInteger("time_elapsed");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("process_state", (table) => {
    table.dropColumn("time_elapsed");
  });
};
