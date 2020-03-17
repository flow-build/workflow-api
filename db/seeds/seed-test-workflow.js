const test_workflow_blueprint = require("./blueprints/test_workflow_blueprint");

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('workflow').del()
    .then(function () {
      // Inserts seed entries
      return knex('workflow').insert([
        {
          id: "d373bef0-1152-11ea-9576-9584815cab84",
          created_at: new Date(),
          name: "test_workflow",
          description: "Workflow para rodar testes sobre a aplicação",
          blueprint_spec: test_workflow_blueprint
        }
      ]);
    });
};
