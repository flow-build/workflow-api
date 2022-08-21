exports.up = function (knex) {
  return knex.schema.table("workflow", (table) => {
    table.text("blueprint_hash");
  });
};

exports.down = function (knex) {
  return knex.schema.table("workflow", (table) => {
    table.dropColumn("blueprint_hash");
  });
};
