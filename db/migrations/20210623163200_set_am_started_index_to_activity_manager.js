exports.up = function (knex) {
  return knex.schema.raw(`CREATE INDEX idx_am_started ON activity_manager (created_at ASC) WHERE status='started'`);
};

exports.down = function (knex) {
  return knex.schema.table("activity_manager", (table) => {
    table.dropIndex("idx_am_started");
  });
};
