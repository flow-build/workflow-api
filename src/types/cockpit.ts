export type Process = {
  process_id: string
  created_at: string
  state_id: string
  status: string
  workflow_name: string
  workflow_version: number
}

export type ProcessState = {
  workflow_name: string
  version: number
  workflow_id: string
  state_id: string
  step_number: number
  next_node_id: string | null
  result: Record<string, any>
  status: string
  created_at: string
}
