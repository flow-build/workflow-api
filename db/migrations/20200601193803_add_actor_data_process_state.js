exports.up = function (knex) {
  return knex.schema.table("process_state", (table) => {
    table.jsonb("actor_data");
  });
};

exports.down = function (knex) {
  return knex.schema.table("process_state", (table) => {
    table.dropColumn("actor_data");
  });
};
