exports.up = function (knex) {
  return knex.schema
    .alterTable("process", (table) => {
      table.uuid("current_state_id");
    })
    .then(() => {
      knex.schema.alterTable("process", (table) => {
        table.foreign("current_state_id").references("process_state.id");
      });
    })
    .then(() => {
      knex.raw(`update process set current_state_id = msn_id.id from
                    (select process_state.id, msn, process_state.process_id from process_state, (
                    select process_state.process_id as pid, max(process_state.step_number)
                        as msn from process_state group by process_state.process_id
                        ) AS sq where process_state.step_number = msn and process_state.process_id = pid) AS msn_id
                    where process.id = msn_id.process_id`);
    });
};

exports.down = function (knex) {
  return knex.schema.alterTable("process", (table) => {
    table.dropColumn("current_state_id");
  });
};
