exports.up = function (knex) {
  return knex.schema.raw(`CREATE INDEX idx_timer_expiration ON timer (expires_at DESC) WHERE active = true`);
};

exports.down = function (knex) {
  return knex.schema.table("timer", (table) => {
    table.dropIndex("idx_timer_expiration");
  });
};
