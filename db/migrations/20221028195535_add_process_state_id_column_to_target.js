exports.up = function (knex) {
  return knex.schema.alterTable("target", (table) => {
    table.uuid("process_state_id");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("target", (table) => {
    table.dropColumn("process_state_id");
  });
};
