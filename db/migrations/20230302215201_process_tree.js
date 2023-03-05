exports.up = function (knex) {
  return knex.schema.createTable("process_tree", (table) => {
    table.uuid("process_id").notNullable();
    table.uuid("root_id").notNullable();
    table.uuid("parent_id");
    table.integer("depth");
    table.index(["process_id"], "idx_process_id");
    table.index(["root_id"], "idx_root_id");
  });
};
  
exports.down = function (knex) {
  return knex.schema.dropTable("process_tree");
};
