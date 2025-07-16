import { getCockpit, getEngine } from "../engine"
import { compareBlueprints } from "../services/compareBlueprints"
import type { Node, WorkflowDTO, WorkflowEntity } from "../types/flowbuild"
import { type Workflow } from "../types/workflow"
import { logger } from "../utils/logger"
import { publishWorkflow } from "../utils/publishWorkflow"
import { validateEnvironmentVariable, validateNodesExtract } from "../validators/workflow"

import "../types/express"
import type { Request, Response } from "express"
import { keys, map, size } from "lodash"

function serializeWorkflow(workflow: WorkflowEntity): WorkflowDTO {
  return {
    id: workflow.workflow_id,
    name: workflow.name,
    description: workflow.description,
    version: workflow._version !== undefined ? workflow._version : workflow.version!,
    hash: workflow._blueprint_hash!,
    blueprint: workflow.blueprint_spec,
    isLatest: workflow._latest
  }
};

function serializeWorkflowNoBlueprint(workflow: WorkflowEntity): Omit<WorkflowDTO, "blueprint"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { blueprint, ...rest } = serializeWorkflow(workflow)
  return rest
}

export async function saveWorkflow(req: Request, res: Response): Promise<void> {
  logger.verbose("[controllers workflow] called saveWorkflow")

  const engine = getEngine()
  const { workflow_id, name, description, blueprint_spec } = req.body

  try {
    await engine.validateBlueprint(blueprint_spec)
  }
  catch (err) {
    let message = "Unknown error"
    if (err instanceof Error) {
      message = `Failed at ${err.message}`
    }
    res.status(409).send({
      error: "Invalid blueprint",
      message
    })
    return
  }

  try {
    const response = await engine.saveWorkflow(name, description, blueprint_spec, workflow_id)
    const warnings: any = {}
    warnings.environment = await validateEnvironmentVariable(blueprint_spec)
    warnings.nodes = validateNodesExtract(blueprint_spec)
    logger.debug("Workflow Created")
    if (!response.error) {
      const workflow = await engine.fetchWorkflow(response.id)
      publishWorkflow(workflow)
      res.status(201).send({
        workflow_id: workflow.id,
        workflow_name: workflow.name,
        hash: workflow._blueprint_hash,
        version: workflow._version,
        warnings: warnings
      })
    }
    else {
      res.status(409).send({
        message: `Failed at ${response.error.errorType}`,
        error: response.error.message
      })
    }
  }
  catch (err) {
    let message = "Unknown error"
    if (err instanceof Error) message = `Failed at ${err.message}`
    res.status(500).send({ message: `Failed at ${message}`, error: err })
  }
};

export async function getWorkflowsForActor(req: Request, res: Response): Promise<void> {
  logger.verbose("[controllers workflow] called getWorkflowsForActor")

  const cockpit = getCockpit()
  const workflows = await cockpit.getWorkflowsForActor(req.actorData)
  const body = map(workflows, (workflow) => {
    return serializeWorkflowNoBlueprint(workflow)
  })

  res.status(200).send(body)
};

export async function listWorkflowsEnviromentVariables(req: Request, res: Response): Promise<void> {
  logger.verbose("[controllers workflow] called listWorkflowsEnviromentVariables")

  const cockpit = getCockpit()
  const workflows = await cockpit.getWorkflows()
  const body = workflows
    .filter((i: Workflow) => size(i.blueprint_spec.environment) > 0)
    .reduce((result: Record<string, any>, item: WorkflowEntity) => {
      const envs = keys(item.blueprint_spec.environment)
      envs.map((env) => {
        if (!result[env]) {
          result[env] = []
        }
        result[env].push(`${item.name} - v${item.version}`)
      })
      return result
    }, {})

  res.status(200).send(body)
};

export async function fetchWorkflow(req: Request, res: Response): Promise<void> {
  logger.verbose("[controllers workflow] called fetchWorkflow")

  const engine = getEngine()
  const workflowId = req.params.id
  const result = await engine.fetchWorkflow(workflowId)

  if (result) {
    res.status(200).send(serializeWorkflow(result))
  }
  else {
    res.status(204)
  }
};

export async function fetchWorkflowByName(req: Request, res: Response): Promise<void> {
  logger.verbose("[controllers workflow] called fetchWorkflowByName")

  const engine = getEngine()
  const workflowName = req.params.name
  const result = await engine.fetchWorkflowByName(workflowName)
  if (result?._id) {
    res.status(200).send(serializeWorkflow(result))
  }
  else {
    res.status(204)
  }
};

export async function deleteWorkflow(req: Request, res: Response): Promise<void> {
  logger.verbose("[controllers workflow] called deleteWorkflow")

  const engine = getEngine()
  const cockpit = getCockpit()
  const workflowId = req.params.id
  const workflow = await engine.fetchWorkflow(workflowId)
  if (!workflow) {
    res.status(409).send({ message: "No such workflow" })
    return
  }

  const filters = { workflow_id: workflowId }
  const processes = await cockpit.fetchProcessList(filters)
  if (processes.length > 0) {
    res.status(422).send({ message: "Cannot delete workflows with processes" })
    return
  }

  const numDeleted = await engine.deleteWorkflow(workflowId)
  if (numDeleted == 0) {
    res.status(409)
  }
  else {
    res.status(204)
  }
};

export async function fetchWorkflowProcessList(req: Request, res: Response): Promise<void> {
  logger.verbose("[controllers workflow] called fetchWorkflowProcessList")

  const cockpit = getCockpit()
  const workflowId = req.params.id
  const filters = { workflow_id: workflowId }
  const processes = await cockpit.fetchProcessList(filters)
  const body = map(processes, (process) => {
    const result = process.serialize()
    return {
      id: result.id,
      created_at: result.created_at,
      workflow_id: result.workflow_id,
      status: result.current_status,
      state: {
        id: result.state.id,
        step_number: result.state.step_number,
        node_id: result.state.node_id,
        next_node_id: result.state.next_node_id,
        node_name: result.blueprint_spec.nodes.find((i: Node) => i.id === result.state.node_id).name
      }
    }
  })

  res.status(200).send(body)
};

export async function createProcess(req: Request, res: Response): Promise<void> {
  logger.verbose("[controllers workflow] called createProcess")

  const engine = getEngine()
  const workflowId = req.params.id
  const actorData = req.actorData
  const input = req.body
  const workflow = await engine.fetchWorkflow(workflowId)

  if (workflow) {
    const process = await engine.createProcess(workflowId, actorData, input)
    if (process) {
      res.status(201).send({
        process_id: process.id,
        workflow: {
          id: workflow.id,
          name: workflow.name,
          version: workflow._version
        }
      })
    }
    else {
      res.status(422).send({ message: `Failed while creating process` })
    }
  }
  else {
    res.status(409).send({ message: `No such workflow` })
  }
};

export async function createProcessByName(req: Request, res: Response): Promise<void> {
  logger.verbose("[controllers workflow] called createProcessByName")

  const engine = getEngine()
  const workflowName = req.params.name
  const actorData = req.actorData
  const input = req.body

  const workflow = await engine.fetchWorkflowByName(workflowName)

  if (workflow?._id) {
    const process = await engine.createProcessByWorkflowName(workflowName, actorData, input)
    if (process) {
      res.status(201).send({
        process_id: process.id,
        workflow: {
          id: workflow.id,
          name: workflow.name,
          version: workflow._version
        }
      })
    }
    else {
      res.status(422).send({ message: `Failed while creating process` })
    }
  }
  else {
    res.status(409).send({ message: `No such workflow` })
  }
}

export async function createAndRunProcessByName(req: Request, res: Response): Promise<void> {
  logger.verbose("[controllers workflow] called createAndRunProcessByName")

  const engine = getEngine()
  const workflowName = req.params.workflowName
  const actorData = req.actorData
  const input = req.body

  const workflow = await await engine.fetchWorkflowByName(workflowName)

  if (workflow?._id) {
    const process = await engine.createProcessByWorkflowName(workflowName, actorData, input)
    if (process && process.id) {
      engine.runProcess(process.id, actorData)
      res.status(201).send({
        process_id: process.id,
        workflow: {
          id: workflow.id,
          name: workflow.name,
          version: workflow._version
        }
      })
    }
    else {
      res.status(422).send({ message: `Failed while creating process` })
    }
  }
  else {
    res.status(409).send({ message: `No such workflow` })
  }
};

export async function validateBlueprint(req: Request, res: Response): Promise<void> {
  logger.verbose("[controllers workflow] called validateBlueprint")

  const engine = getEngine()
  const { blueprint_spec } = req.body

  try {
    await engine.validateBlueprint(blueprint_spec)
    res.status(200).send({ message: "Blueprint is valid" })
  }
  catch (err: any) {
    res.status(422).send({
      error: "Invalid blueprint",
      message: `Failed at ${err.message}`
    })
  }
};

export async function compareBlueprint(req: Request, res: Response): Promise<void> {
  logger.verbose("[controllers workflow] called compareBlueprint")
  const { name, blueprint_spec } = req.body

  try {
    const compare = await compareBlueprints(name, blueprint_spec)

    if (compare.error) {
      res.status(422).send({
        error: "Invalid blueprint",
        message: `Failed at ${compare.error}`
      })
    }
    else if (compare.changes) {
      if (compare.currentWorkflow) {
        res.status(202).send({
          status: "Changes found, check comparison",
          currentWorkflow: compare.currentWorkflow,
          comparison: compare.comparison
        })
      }
      else {
        res.status(409).send({ status: "No workflow with this name" })
      }
    }
    else {
      res.status(200).send({
        status: "No changes found",
        currentWorkflow: compare.currentWorkflow
      })
    }
  }
  catch (err) {
    logger.error(err)
    res.status(422).send({
      error: err
    })
  }
};
