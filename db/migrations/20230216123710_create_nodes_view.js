exports.up = function (knex) {
  return knex.schema.createView("nodes", (view) => {
    view.columns(["workflow_id", "workflow_name", "workflow_version", "latest", "node_id", "node_type", "node_category"]);
    view.as(
      knex.raw(
        `select
              w1.id as workflow_id,
              w1.name as workflow_name,
              w1.version as workflow_version,
              case when w1.version = wmax.version then true else false end as latest,
              jsonb_array_elements(w1.blueprint_spec -> 'nodes') ->> 'id' as node_id,
              jsonb_array_elements(w1.blueprint_spec -> 'nodes') ->> 'type' as node_type,
              jsonb_array_elements(w1.blueprint_spec -> 'nodes') ->> 'category' as category
          from workflow w1
              join (select name, max(version) as version from workflow group by name) as wmax on w1.name = wmax.name`
      )
    );
  });
};

exports.down = function (knex) {
  return knex.schema.dropViewIfExists("nodes");
};
