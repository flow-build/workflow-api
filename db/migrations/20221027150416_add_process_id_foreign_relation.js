exports.up = function (knex) {
  return knex.schema.alterTable("trigger", (table) => {
    table.foreign("process_id").references("process.id");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("trigger", (table) => {
    table.dropForeign("trigger_process_id_foreign");
  });
};
