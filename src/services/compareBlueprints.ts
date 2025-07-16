import { getEngine } from "../engine"
import { BlueprintSpec, Node } from "../types/flowbuild"

import { isEqual } from "lodash"

type CompareBlueprintOutput = {
  changes: boolean
  currentWorkflow?: {
    id: string
    version: number
  }
  comparison?: {
    nodes: boolean
    lanes: boolean
    prepare: boolean
    environment: boolean
    requirements: boolean
  }
  error?: string
}

export async function compareBlueprints(workflow_name: string, blueprint_spec: BlueprintSpec): Promise<CompareBlueprintOutput> {
  const engine = getEngine()
  let result: CompareBlueprintOutput = { changes: false }

  try {
    await engine.validateBlueprint(blueprint_spec)
    const currentWorkflow = await engine.fetchWorkflowByName(workflow_name)
    if (currentWorkflow) {
      const cur_wf_ordered_nodes = currentWorkflow.blueprint_spec.nodes.sort((a: Node, b: Node) => {
        return a.id > b.id ? -1 : 0
      })
      const bp_ordered_nodes = blueprint_spec.nodes.sort((a, b) => {
        return a.id > b.id ? -1 : 0
      })

      const cur_wf_ordered_lanes = currentWorkflow.blueprint_spec.lanes.sort((a: Node, b: Node) => {
        return a.id > b.id ? -1 : 0
      })
      const bp_ordered_lanes = blueprint_spec.lanes.sort((a, b) => {
        return a.id > b.id ? -1 : 0
      })

      const nodes = isEqual(cur_wf_ordered_nodes, bp_ordered_nodes)
      const lanes = isEqual(cur_wf_ordered_lanes, bp_ordered_lanes)
      const prepare = isEqual(currentWorkflow.blueprint_spec.prepare, blueprint_spec.prepare)
      const environment = isEqual(currentWorkflow.blueprint_spec.environment, blueprint_spec.environment)
      const requirements = isEqual(currentWorkflow.blueprint_spec.requirements, blueprint_spec.requirements)

      if (nodes && lanes && prepare && environment && requirements) {
        result = {
          changes: false,
          currentWorkflow: {
            id: currentWorkflow._id,
            version: currentWorkflow._version
          }
        }
      }
      else {
        result = {
          changes: true,
          currentWorkflow: {
            id: currentWorkflow._id,
            version: currentWorkflow._version
          },
          comparison: {
            nodes: nodes,
            lanes: lanes,
            prepare: prepare,
            environment: environment,
            requirements: requirements
          }
        }
      }
    }
    else {
      result = {
        changes: true
      }
    }
  }
  catch (err) {
    result.error = (err as any).toString()
  }

  return result
};
