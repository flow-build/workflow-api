import { getCockpit } from "../engine"
import { logger } from "../utils/logger"

import "../types/express"
import { getNode } from "@flowbuild/engine"
import type { NextFunction, Request, Response } from "express"
import _ from "lodash"

// Types for state and process (can be refined if needed)
type State = {
  _id: string
  _created_at: string
  _process_id: string
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
    nodes: any[]
  }
}

async function getStateById(id: string): Promise<State | null> {
  const cockpit = getCockpit()
  return await cockpit.getProcessState(id)
}

async function getStateByStepNumber(processId: string, stepNumber: number): Promise<State | null> {
  const cockpit = getCockpit()
  return await cockpit.findProcessStatesByStepNumber(processId, stepNumber)
}

async function getStateByNodeId(processId: string, nodeId: string): Promise<State[] | null> {
  const cockpit = getCockpit()
  return await cockpit.findProcessStatesByNodeId(processId, nodeId)
}

async function getProcessById(id: string): Promise<Process | null> {
  const cockpit = getCockpit()
  return await cockpit.fetchProcess(id)
}

async function getStateExecutionContext(state_id: string): Promise<any> {
  const cockpit = getCockpit()
  return await cockpit.fetchStateExecutionContext(state_id)
}

function serializeState(state: State) {
  return {
    id: state._id,
    created_at: state._created_at,
    process_id: state._process_id,
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

function stateNotFound(res: Response) {
  res.status(404).json({ message: "stateId not found" })
}

function buildExecutionResponse(spec: any, node: any, input: any) {
  const keys = Object.keys(spec.parameters)
  const executionData: Record<string, any> = {}
  const parameters = keys.reduce((executionData, key) => {
    return { ...executionData, ...{ [key]: node[key] || node._spec.parameters[key] } }
  }, executionData)
  return { ...parameters, ...{ input } }
}

async function buildStateResponse(states: State | State[] | null, process: Process | null) {
  let response: any = {}
  if (!_.isArray(states)) {
    response = {
      ...serializeState(states as State),
      ...{
        environment: process?._blueprint_spec?.environment,
        parameters: process?._blueprint_spec?.parameters
      }
    }
    return response
  }
  if (states && states.length > 0) {
    response = {
      environment: process?._blueprint_spec?.environment,
      parameters: process?._blueprint_spec?.parameters,
      states: _.map(states, (state: State) => serializeState(state))
    }
  }
  else {
    response = {
      message: "no state found with the parameter provided"
    }
  }
  return response
}

export async function fetchById(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("called fetchStateByParameters")
  const stateId = req.params.id
  const state = await getStateById(stateId)
  if (!state) {
    stateNotFound(res)
    return next()
  }
  const processId = state._process_id
  const process = await getProcessById(processId)
  const response = await buildStateResponse(state, process)
  res.status(200).json(response)
  return next()
}

export async function fetchStateExecution(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("called fetchStateExecution")
  const stateId = req.params.id
  const response = await getStateExecutionContext(stateId)
  res.status(200).json(response)
  return next()
}

export async function fetchMultipleStateExecution(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("called fetchMultipleStateExecution")
  const processId = req.params.process_id
  const nodeId = req.params.node_id
  const states = await getStateByNodeId(processId, nodeId)
  if (!states) {
    res.status(404).json({ message: "no states found for given process_id and node_id" })
    return next()
  }
  const response = await Promise.all(states.map((state: State) => getStateExecutionContext(state._id)))
  res.status(200).json(response)
  return next()
}

export async function fetchStateByParameters(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("called fetchStateByParameters")
  const processId = req.params.id
  const nodeId = req.query.nodeId as string | undefined
  const stepNumber = req.query.stepNumber ? parseInt(req.query.stepNumber as string) : undefined
  if (!nodeId && !stepNumber) {
    res.status(400).json({ message: "you should define at least one param (nodeId or stepNumber)" })
    return next()
  }
  const process = await getProcessById(processId)
  if (!process) {
    res.status(404).json({ message: "process not found" })
    return next()
  }
  let states: State[] | State | null = null
  if (stepNumber) {
    states = await getStateByStepNumber(processId, stepNumber)
  }
  else if (nodeId) {
    states = await getStateByNodeId(processId, nodeId)
  }
  if (!states) {
    res.status(404).json({
      message: "no state found with the parameter provided",
      params: { nodeId, stepNumber }
    })
    return next()
  }
  const response = await buildStateResponse(states, process)
  res.status(200).json(response)
  return next()
}

export async function fetchSpec(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("called calculateExecutionData")
  const stateId = req.params.id
  const state = await getStateById(stateId)
  if (!state) {
    stateNotFound(res)
    return next()
  }
  const process = await getProcessById(state._process_id)
  const nodeSpec = process?._blueprint_spec?.nodes.find((node: any) => node.id === state._node_id)
  if (!nodeSpec) {
    res.status(404).json({ message: "node spec not found" })
    return next()
  }
  const node = await getNode(nodeSpec)
  res.status(200).json(node._spec)
  return next()
}

export async function calculateExecutionData(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("called calculateExecutionData")
  const stateId = req.params.id
  const state = await getStateById(stateId)
  if (!state) {
    stateNotFound(res)
    return next()
  }
  const process = await getProcessById(state._process_id)
  const previousState = await getStateByStepNumber(state._process_id, state._step_number)
  const nodeSpec = process?._blueprint_spec?.nodes.find((node: any) => node.id === state._node_id)
  if (!nodeSpec) {
    res.status(404).json({ message: "node spec not found" })
    return next()
  }
  const node = await getNode(nodeSpec)
  const response = await node._preProcessing({
    bag: previousState?._bag,
    input: previousState?._result,
    actor_data: previousState?._actor_data,
    environment: process?._blueprint_spec?.environment,
    parameters: process?._blueprint_spec?.parameters
  })
  res.status(200).json(buildExecutionResponse(nodeSpec, node, response))
  return next()
}
