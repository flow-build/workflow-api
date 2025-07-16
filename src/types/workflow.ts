export type Workflow = {
  workflow_id: string
  name: string
  description: string
  blueprint_spec: BlueprintSpec
}

export type BlueprintSpec = {
  requirements: string[]
  prepare: string[]
  environment: Record<string, any>
  parameters?: Record<string, any>
  lanes: Lane[]
  nodes: Node[]
}

export type Lane = {
  id: string
  name: string
  rule: any[] | LaneRule
}

export type LaneRule = {
  $js: string
}

export type Node = {
  id: string
  name: string
  type: string
  category: string
  lane_id: string
  next: string | Record<string, any> | null
  parameters: Record<string, any>
}
