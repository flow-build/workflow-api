exports.up = function (knex) {
  return knex.schema.table("process_state", (table) => {
    table.uuid("engine_id");
  });
};

exports.down = function (knex) {
  return knex.schema.table("process_state", (table) => {
    table.dropColumn("engine_id");
  });
};
