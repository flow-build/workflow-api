exports.up = function (knex) {
  return knex.schema.alterTable("trigger", (table) => {
    table.uuid("target_process_id");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("trigger", (table) => {
    table.dropColumn("target_process_id");
  });
};
