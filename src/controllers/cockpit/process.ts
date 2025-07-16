import { getCockpit, getEngine } from "../../engine"
import * as cockpitService from "../../services/cockpit"
import { logger } from "../../utils/logger"

import "../../types/express"
import type { NextFunction, Request, Response } from "express"

// Helper for setState
async function setState(process: any, state_data: any) {
  const cockpit = getCockpit()
  const process_id = process.id
  const result = await cockpit.setProcessState(process_id, state_data)
  return {
    workflow_name: process.workflow_name,
    process_id: process._id,
    state: {
      state_id: result.id,
      step_number: result.step_number,
      node_id: result.node_id,
      next_node_id: result.next_node_id,
      status: result.status,
      result: result.result,
      bag: result.bag,
      actor_data: "actor data will bet set by state run"
    },
    message: "to resume process execute a state run"
  }
}

export async function setProcessState(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("Called setProcessState")
  const cockpit = getCockpit()
  const process_id = req.params.id
  const state_data = req.body
  const process = await cockpit.fetchProcess(process_id)
  if (process) {
    const next_node = process._blueprint_spec.nodes.find((n: any) => n.id === state_data.next_node_id)
    if (next_node) {
      const result = await setState(process, state_data)
      res.status(200).json(result)
    }
    else {
      res.status(404).json({ message: "No such next_node" })
    }
  }
  else {
    res.status(404).json({ message: "No such process" })
  }
  return next()
}

export async function transferProcessState(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("Called transferProcessState")
  const cockpit = getCockpit()
  const process_id = req.params.id
  const state_id = req.params.state_id
  const process = await cockpit.fetchProcess(process_id)
  if (process) {
    const state = await cockpit.getProcessState(state_id)
    if (state) {
      const next_node = process._blueprint_spec.nodes.find((n: any) => n.id === state.next_node_id)
      if (next_node) {
        const state_data = {
          next_node_id: state.next_node_id,
          bag: state.bag,
          result: state.result
        }
        const result = await setState(process, state_data)
        res.status(200).json(result)
      }
      else {
        res.status(400).json({ message: "State incompatible to process" })
      }
    }
    else {
      res.status(404).json({ message: "No such state" })
    }
  }
  else {
    res.status(404).json({ message: "No such process" })
  }
  return next()
}

export async function runPendingProcess(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("Called runPendingProcess")
  const cockpit = getCockpit()
  const process_id = req.params.id
  const actor_data = req.body
  const process = await cockpit.fetchProcess(process_id)
  if (process) {
    if (process._current_status === "pending") {
      try {
        await cockpit.runPendingProcess(process_id, actor_data)
        res.status(202).json({
          message: "process resumed, get process to check its current state",
          process_url: `${req.headers.host}/processes/${process_id}`
        })
      }
      catch (e: any) {
        res.status(400).json({ message: `Failed at ${e.message}`, error: e })
      }
    }
    else {
      res.status(422).json({ message: "Invalid process status" })
    }
  }
  else {
    res.status(404).json({ message: "No such process" })
  }
  return next()
}

export async function getProcessesByWorkflowId(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("Cockpit getProcessesByWorkflowId")
  const workflow_id = req.params.id
  const engine = getEngine()
  const workflow = await engine.fetchWorkflow(workflow_id)
  if (workflow) {
    try {
      const result = await cockpitService.fetchWorkflowProcessesByWorkflowId(workflow_id)
      res.status(200).json(result.map((p: any) => ({
        process_id: p.id,
        created_at: p.created_at,
        state_id: p.current_state_id,
        status: p.current_status,
        workflow_name: p.name,
        workflow_version: p.version
      })))
    }
    catch (e: any) {
      res.status(400).json({ message: `Failed at ${e.message}`, error: e })
    }
  }
  else {
    res.status(404).json({ message: "No such workflow" })
  }
  return next()
}

export async function getProcessesByWorkflowName(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("Cockpit getProcessesByWorkflowName")
  const workflow_name = req.params.name
  const engine = getEngine()
  const workflow = await engine.fetchWorkflowByName(workflow_name)
  if (workflow?._id) {
    try {
      const result = await cockpitService.fetchWorkflowProcessesByWorkflowName(workflow_name)
      res.status(200).json(result.map((p: any) => ({
        process_id: p.id,
        created_at: p.created_at,
        state_id: p.current_state_id,
        status: p.current_status,
        workflow_name: p.name,
        workflow_version: p.version
      })))
    }
    catch (e: any) {
      res.status(400).json({ message: `Failed at ${e.message}`, error: e })
    }
  }
  else {
    res.status(404).json({ message: "No such workflow" })
  }
  return next()
}

export async function getProcessStateExecutionHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("Cockpit getProcessStateExecutionHistory")
  const process_id = req.params.id
  const qs = req.query
  const filters = {
    fromStep: qs.fromStep || null
  }
  const cockpit = getCockpit()
  try {
    const result = await cockpit.getProcessStateExecutionHistory(process_id, filters)
    res.status(200).json(result)
  }
  catch (e: any) {
    res.status(400).json({ message: `Failed at ${e.message}`, error: e })
  }
  return next()
}

export async function getStatesFromNode(req: Request, res: Response, next: NextFunction): Promise<void> {
  const workflow_name = req.params.name
  const node_id = req.params.node_id
  try {
    const result = await cockpitService.fetchStatesByNodeId(workflow_name, node_id)
    res.status(200).json(result)
  }
  catch (e: any) {
    res.status(400).json({ message: `Failed at ${e.message}`, error: e })
  }
  return next()
}

export async function expireProcess(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("Cockpit expireProcess")
  const process_id = req.params.id
  const actor_data = req.state?.actor_data
  const result = req.body
  const cockpit = getCockpit()
  const process = await cockpit.fetchProcess(process_id)
  if (!process) {
    res.status(404).json({ message: "Process not found" })
    return next()
  }
  try {
    await cockpit.expireProcess(process_id, actor_data, result)
    res.status(200).json({ message: "Process expired" })
  }
  catch (e: any) {
    res.status(400).json({ message: `Failed at ${e.message}`, error: e })
  }
  return next()
}
