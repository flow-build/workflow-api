const { v1:uuid } = require("uuid"); 
const fs = require("fs");
const path = require("path");

async function getSpecs() {
  const files = fs.readdirSync('db/seeds/node_specs/')
  const nodes = [];
  
  files.forEach(async (file) => {
    const scriptName = path.basename(`./node_specs/${file}`, ".js");
    const spec = require(`./node_specs/${scriptName}`);
    nodes.push({
      id: uuid(),
      created_at: new Date(),
      spec_name: file,
      node_lane_id: spec.lane_id,
      node_name: spec.name,
      node_type: spec.type,
      node_category: spec.category,
      node_parameters: spec.parameters
    })
  });

  return nodes;
}


exports.seed = async function(knex) {
  const nodes = await getSpecs();
  console.log(`Seed ${nodes.length} node specs`)
  return knex('node_spec').del()
    .then(function () {
      return knex('node_spec').insert(nodes);
    })
};
