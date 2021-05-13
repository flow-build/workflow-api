const test_workflow_blueprint = require("./blueprints/test_workflow_blueprint");
const pizza1_blueprint = require("./blueprints/pizza1_blueprint");
const pizza2_blueprint = require("./blueprints/pizza2_blueprint");

exports.seed = function (knex, Promise) {
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
          version: 1,
          blueprint_spec: test_workflow_blueprint
        },
        {
          id: "7be513f4-98dc-43e2-8f3a-66e68a61aca8",
          created_at: new Date(),
          name: "pizza1",
          description: "Cookbook somente com systemTasks, mostrando o uso das notacoes de atalho",
          version: 1,
          blueprint_spec: pizza1_blueprint
        },
        {
          id: "8fc66458-1137-4c1a-9aef-5dcdca9a19f6",
          created_at: new Date(),
          name: "pizza2",
          description: "Cookbook com userTasks e lanes",
          version: 1,
          blueprint_spec: pizza2_blueprint
        }
      ]);
    });
};
