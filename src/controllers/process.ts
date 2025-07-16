import { getCockpit, getEngine } from "../engine"
import { logger } from "../utils/logger"

import "../types/express"
import type { NextFunction, Request, Response } from "express"
import _ from "lodash"

const stoppedStatus = ["finished", "interrupted", "error"]

// Types for process and state (can be refined if needed)
type State = {
  _id: string
  _created_at: string
  _step_number: number
  _node_id: string
  _next_node_id: string | null
  _bag: Record<string, any>
  _external_input: string | null
  _result: Record<string, any>
  _error: string | null
  _status: string
  _actor_data: Record<string, any>
  _engine_id: string
  _time_elapsed: string | null
}

type Process = {
  id: string
  _created_at: string
  _workflow_id: string
  _workflow: {
    name: string
    version: number
    isLatest?: boolean
  }
  state?: State
  _current_status?: string
  _blueprint_spec?: {
    environment?: Record<string, any>
    parameters?: Record<string, any>
  }
}

function serializeState(state: State) {
  return {
    id: state._id,
    created_at: state._created_at,
    step_number: state._step_number,
    node_id: state._node_id,
    next_node_id: state._next_node_id,
    bag: state._bag,
    external_input: state._external_input,
    result: state._result,
    error: state._error,
    status: state._status,
    actor_data: state._actor_data,
    engine_id: state._engine_id,
    time_elapsed: state._time_elapsed
  }
}

function serializeProcess(process: Process) {
  const state = process.state
  return {
    id: process.id,
    created_at: process._created_at,
    workflow: {
      id: process._workflow_id,
      name: process._workflow.name,
      version: process._workflow.version,
      isLatest: process._workflow.isLatest
    },
    state: state ? serializeState(state) : undefined
  }
}

export async function fetchProcess(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("called fetchProcess")
  const cockpit = getCockpit()
  const processId = req.params.id
  const process = await cockpit.fetchProcess(processId)
  if (process) {
    res.status(200).json(serializeProcess(process))
  }
  else {
    res.status(204).send()
  }
  return next()
}

export async function listProcesses(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("Called listProcesses")
  const filters = req.body
  const cockpit = getCockpit()
  const processes = await cockpit.fetchProcessList(filters)
  res.status(200).json(_.map(processes, (process: Process) => serializeProcess(process)))
  return next()
}

export async function fetchProcessList(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("Called fetchProcessList")
  const cockpit = getCockpit()
  const query_params = req.query
  const workflowId = query_params.workflow_id as string | undefined
  const filters = workflowId ? { workflow_id: workflowId } : {}
  const processes = await cockpit.fetchProcessList(filters)
  res.status(200).json(_.map(processes, (process: Process) => serializeProcess(process)))
  return next()
}

export async function fetchProcessStateHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("called fetchProcessStateHistory")
  const cockpit = getCockpit()
  const processId = req.params.id
  const qs = req.query
  const filters = {
    fromStep: qs.fromStep || null
  }
  const states = await cockpit.fetchProcessStateHistory(processId, filters)
  if (states) {
    if (states.length) {
      res.status(200).json(_.map(states, (state: State) => serializeState(state)))
      return next()
    }
    res.status(204).send()
  }
  else {
    res.status(204).send()
  }
  return next()
}

export async function runProcess(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("called runProcess")
  const cockpit = getCockpit()
  const processId = req.params.id
  const actor_data = req.actorData
  const input = req.body
  const process = await cockpit.fetchProcess(processId)
  if (process) {
    if (stoppedStatus.includes(process._current_status)) {
      res.status(422).json({ current_status: process._current_status })
    }
    else {
      const result = await cockpit.runProcess(processId, actor_data, input)
      res.status(result ? 200 : 204).send()
    }
  }
  else {
    res.status(204).send()
  }
  return next()
}

export async function abortProcess(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("Called abortProcess")
  const cockpit = getCockpit()
  const processId = req.params.id
  const actorData = req.actorData
  const process = await cockpit.fetchProcess(processId)
  if (process) {
    if (stoppedStatus.includes(process._current_status)) {
      res.status(422).json({ current_status: process._current_status })
    }
    else {
      const result = await cockpit.abortProcess(processId, actorData)
      res.status(result ? 200 : 404).send()
    }
  }
  else {
    res.status(404).send()
  }
  return next()
}

export async function fetchStateByParameters(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("called fetchStateByParameters")
  const cockpit = getCockpit()
  const processId = req.params.id
  const nodeId = req.query.nodeId as string | undefined
  const stepNumber = req.query.stepNumber ? parseInt(req.query.stepNumber as string) : undefined
  if (!nodeId && !stepNumber) {
    res.status(400).json({ message: "you should define at least one param (nodeId or stepNumber)" })
    return next()
  }
  const process = await cockpit.fetchProcess(processId)
  const states = await cockpit.fetchProcessStateHistory(processId)
  if (!states) {
    res.status(404).json({ message: "process not found" })
    return next()
  }
  let filteredStates: State[] = []
  if (stepNumber) {
    filteredStates = states.filter((item: State) => item._step_number === stepNumber)
  }
  else if (nodeId) {
    filteredStates = states.filter((item: State) => item._node_id == nodeId)
  }
  if (filteredStates.length > 0) {
    res.status(200).json({
      environment: process?._blueprint_spec?.environment,
      parameters: process?._blueprint_spec?.parameters,
      states: _.map(filteredStates, (state: State) => serializeState(state))
    })
  }
  else {
    res.status(404).json({
      message: "no state found with the parameter provided",
      params: { nodeId, stepNumber }
    })
  }
  return next()
}

export async function continueProcess(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("called continueProcess")
  const engine = getEngine()
  const processId = req.params.id
  const actorData = req.actorData
  const input = req.body
  const result = await engine.continueProcess(processId, actorData, input)
  if (result?.error) {
    res.status(422).json(result.error)
    return next()
  }
  res.status(200).json({ message: "Process continue signaled" })
  return next()
}
