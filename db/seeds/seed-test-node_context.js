const { v1:uuid } = require("uuid"); 
const fs = require("fs");
const path = require("path");

async function getSpecs() {
  const files = fs.readdirSync('db/seeds/node_context/')
  const examples = [];
  
  files.forEach(async (file) => {
    const scriptName = path.basename(`./node_context/${file}`, ".js");
    const spec = require(`./node_context/${scriptName}`);
    examples.push({
      id: uuid(),
      created_at: new Date(),
      workflow_name: spec.workflow_name,
      node_id: spec.node_id,
      bag: spec.bag,
      result: spec.result,
      actor_data: spec.actor_data,
      environment: spec.environment,
      parameters: spec.parameters
    })
  });

  return examples;
}


exports.seed = async function(knex) {
  const data = await getSpecs();
  console.log(`Seed ${data.length} node context`)
  return knex('node_context').del()
    .then(function () {
      return knex('node_context').insert(data);
    })
};
