let db;

function setDbConnection(dbConnection) {
  db = dbConnection;
}

async function fetchWorkflowByName(workflow_name) {
  let result;

  result = await db("workflow").where("name", workflow_name).orderBy("created_at", "desc");

  return result;
}

async function fetchWorkflowProcessesByWorkflowName(workflow_name, status = null, limit = 20, offset = 0) {
  let result;

  let query = await db("process")
    .select(
      "process.id",
      "process.created_at",
      "process.current_state_id",
      "process.current_status",
      "workflow.name",
      "workflow.version"
    )
    .join("workflow", "workflow.id", "process.workflow_id")
    .where("workflow.name", workflow_name)
    .orderBy("process.created_at", "desc")
    .limit(limit)
    .offset(offset);

  if (status && typeof status === "object") {
    query.whereIn("process.current_status", status);
  }

  result = await query;

  return result;
}

async function fetchWorkflowProcessesByWorkflowId(workflow_id, status = null, limit = 20, offset = 0) {
  let result;

  let query = await db("process")
    .select(
      "process.id",
      "process.created_at",
      "process.current_state_id",
      "process.current_status",
      "workflow.name",
      "workflow.version"
    )
    .join("workflow", "workflow.id", "process.workflow_id")
    .where("workflow.id", workflow_id)
    .orderBy("process.created_at", "desc")
    .limit(limit)
    .offset(offset);

  if (status && typeof status === "object") {
    query.whereIn("process.current_status", status);
  }

  result = await query;

  return result;
}

async function fetchProcessExecution(process_id) {
  let result;

  result = await db("process_state")
    .select("id", "step_number", "node_id", "next_node_id", "status")
    .where("process_id", process_id)
    .orderBy("step_number", "desc");

  return result;
}

// eslint-disable-next-line no-unused-vars
async function fetchStatesByNodeId(workflow_name, node_id, filters = null) {
  let result;

  //TODO: add filters for date, status

  result = await db("process_state")
    .select(
      "workflow.name as workflow_name",
      "workflow.version",
      "workflow.id as workflow_id",
      "process_state.id as state_id",
      "process_state.step_number",
      "process_state.next_node_id",
      "process_state.result",
      "process_state.status",
      "process_state.created_at"
    )
    .join("process", "process.id", "process_state.process_id")
    .join("workflow", "workflow.id", "process.workflow_id")
    .where("process_state.node_id", node_id)
    .where("workflow.name", workflow_name)
    .orderBy("created_at", "desc");

  return result;
}

module.exports = {
  setDbConnection,
  fetchWorkflowByName,
  fetchWorkflowProcessesByWorkflowName,
  fetchWorkflowProcessesByWorkflowId,
  fetchProcessExecution,
  fetchStatesByNodeId,
};
