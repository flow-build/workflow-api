const _ = require("lodash");
const { db } = require("../utils/db");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const cleanDb = async () => {
  await db.raw("truncate table workflow cascade");
  await db("timer").del();
  await delay(1000);
  await db("index").del();
};

const validateWorkflow = (base, target) => {
  expect(base.id).toBe(target.id);
  expect(base.name).toBe(target.name);
  expect(base.description).toBe(target.description);
  //expect(base.blueprint_spec).toMatchObject(target.blueprint_spec); blueprint_spec should not be returned on listing
  expect(target.created_at).toBeDefined();
};

const validateProcess = (process, workflow_id) => {
  expect(process.id).toBeDefined();
  expect(process.created_at).toBeDefined();
  expect(process.workflow_id).toBe(workflow_id);
  expect(process.blueprint_spec).toBeUndefined();
};

const validateProcessState = (
  state,
  process_id,
  step_number,
  node_id,
  next_node_id,
  bag,
  external_input,
  result,
  error,
  status
) => {
  expect(state.id).toBeDefined();
  expect(state.created_at).toBeDefined();
  expect(state.process_id).toBe(process_id);
  expect(state.step_number).toBe(step_number);
  expect(state.node_id).toBe(node_id);
  expect(state.next_node_id).toBe(next_node_id);
  expect(state.bag).toMatchObject(bag);
  expect(state.external_input).toMatchObject(external_input);
  expect(state.result).toMatchObject(result);
  expect(state.error).toBe(error);
  expect(state.status).toBe(status);
};

const validateTask = (task, workflow_name, process_status, node_name, lane_name, process_step_number) => {
  expect(task.workflow_name).toBe(workflow_name);
  expect(task.step_number).toBe(process_step_number);
};

// this function assumes the position of the node in blueprint_spec
// is enough to infer its corresponding step_number, which doesn't
// hold true for processes in general.
const validateTaskWithWorkflow = (task, workflow, process_status) => {
  const blueprint_spec = workflow.blueprint_spec;
  const node_idx = _.findIndex(blueprint_spec.nodes, { id: task.node_id });
  const node = blueprint_spec.nodes[node_idx];
  const step_number = node_idx + 2;
  const lane = _.find(blueprint_spec.lanes, { id: node.lane_id });
  validateTask(task, workflow.name, process_status, node.id, lane.name, step_number);
};

module.exports = {
  validateWorkflow,
  validateProcess,
  validateProcessState,
  validateTask,
  validateTaskWithWorkflow,
  delay,
  cleanDb,
};
