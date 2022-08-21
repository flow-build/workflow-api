exports.up = function (knex) {
  return knex.schema.table("process_state", (table) => {
    table.index("process_id", "idx_process_state_process_id");
  });
};

exports.down = function (knex) {
  return knex.schema.table("process_state", (table) => {
    table.dropIndex("idx_process_state_process_id");
  });
};
