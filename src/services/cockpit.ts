let db: any

export function setDbConnection(dbConnection: any): void {
  db = dbConnection
}

export async function fetchWorkflowByName(workflow_name: string): Promise<any> {
  return await db("workflow").where("name", workflow_name).orderBy("created_at", "desc")
}

export async function fetchWorkflowProcessesByWorkflowName(
  workflow_name: string,
  status: any = null,
  limit: number = 20,
  offset: number = 0
): Promise<any[]> {
  let query = db("process")
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
    .offset(offset)

  if (status && typeof status === "object") {
    query = query.whereIn("process.current_status", status)
  }

  return await query
}

export async function fetchWorkflowProcessesByWorkflowId(
  workflow_id: string,
  status: any = null,
  limit: number = 20,
  offset: number = 0
): Promise<any[]> {
  let query = db("process")
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
    .offset(offset)

  if (status && typeof status === "object") {
    query = query.whereIn("process.current_status", status)
  }

  return await query
}

export async function fetchProcessExecution(process_id: string): Promise<any[]> {
  return await db("process_state")
    .select("id", "step_number", "node_id", "next_node_id", "status")
    .where("process_id", process_id)
    .orderBy("step_number", "desc")
}

export async function fetchStatesByNodeId(
  workflow_name: string,
  node_id: string
): Promise<any[]> {
  // TODO: add filters for date, status
  return await db("process_state")
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
    .orderBy("created_at", "desc")
}
