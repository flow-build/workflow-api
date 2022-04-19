exports.up = function (knex) {
  return knex.schema.raw(`CREATE INDEX idx_am_action ON activity_manager ((props ->> 'action'), created_at)`);
};

exports.down = function (knex) {
  return knex.schema.table("activity_manager", (table) => {
    table.dropIndex("idx_am_action");
  });
};
