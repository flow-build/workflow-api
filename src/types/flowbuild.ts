export type Workflow = {
  id: string
  name: string
  description: string
  hash: string
  version: number
  blueprint: BlueprintSpec
  isLatest?: boolean
}

export type WorkflowEntity = {
  workflow_id: string
  created_at: string
  name: string
  description: string
  blueprint_hash?: string
  _blueprint_hash?: string
  version?: number
  _version?: number
  blueprint_spec: BlueprintSpec
  _latest?: boolean
}

export type WorkflowDTO = {
  id: string
  name: string
  description: string
  version?: number
  hash?: string
  blueprint: BlueprintSpec
  isLatest?: boolean
}

export type BlueprintSpec = {
  prepare: string[]
  requirements: string[]
  environment: Record<string, any>
  parameters: Record<string, any>
  lanes: Lane[]
  nodes: Node[]
}

export type Lane = {
  id: string
  name: string
  rule: string[] | LaneRule
}

export type LaneRule = {
  $js: string
}

export type Node = {
  id: string
  name: string
  type: string
  category: string
  laneId: string
  next: string | Record<string, any> | null
  parameters: {
    target: string
  }
  lane_id: string
  extract?: string
}
