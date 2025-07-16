export type ProcessState = {
  id: string
  process_id: string
  step_number: number
  node_id: string
  next_node_id: string | null
  bag: Record<string, any>
  external_input: string | null
  result: Record<string, any>
  error: string | null
  status: string
  created_at: string
  actor_data: Record<string, any>
  engine_id: string
  time_elapsed: string | null
}
