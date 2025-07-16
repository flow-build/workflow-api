import { getCockpit, getEngine } from "../engine"
import { logger } from "../utils/logger"

import "../types/express"
import type { NextFunction, Request, Response } from "express"

function serializeTask(task: any) {
  return {
    id: task.id,
    state_id: task.process_state_id,
    process_id: task.process_id,
    workflow_id: task.workflow_id,
    created_at: task.created_at,
    type: task.type,
    props: task.props,
    process_status: task.current_status,
    workflow_name: task.workflow_name,
    workflow_description: task.workflow_description,
    node_name: task.blueprint_spec.nodes.find((e: any) => e.id === task.node_id).name
  }
}

export async function fetchAvailableActivitiesForActor(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("Called fetchAvailableActivitiesForActor")
  const cockpit = getCockpit()
  const actor_data = req.state?.actor_data
  const query_params = req.query
  const workflow_id = query_params.workflow_id as string | undefined
  const filters = workflow_id ? { workflow_id } : {}
  const tasks = await cockpit.fetchAvailableActivitiesForActor(actor_data, filters)
  res.status(200).json(tasks.map((task: any) => serializeTask(task)))
  return next()
}

export async function fetchAvailableActivitiesForActorReduced(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("Called fetchAvailableActivitiesForActor")
  const cockpit = getCockpit()
  const actor_data = req.state?.actor_data
  const query_params = req.query
  const workflow_id = query_params.workflow_id as string | undefined
  const filters = workflow_id ? { workflow_id } : {}
  let tasks = await cockpit.fetchAvailableActivitiesForActor(actor_data, filters)
  tasks = tasks
    .filter((e: any) => ["finished", "interrupted", "pending"].indexOf(e.process_status) < 0)
    .map((task: any) => {
      const response = {
        activity_manager_id: task.id,
        process_id: task.process_id,
        workflow_id: task.workflow_id,
        created_at: task.created_at,
        type: task.type,
        workflow_name: task.workflow_name,
        process_status: task.process_status,
        node_name: task.blueprint_spec.nodes.find((e: any) => e.id === task.node_id).name,
        action: task.props.action
      }
      return response
    })
  res.status(200).json(tasks)
  return next()
}

export async function fetchDoneActivitiesForActor(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("Called fetchDoneActivitiesForActor")
  const cockpit = getCockpit()
  const actor_data = req.state?.actor_data
  const query_params = req.query
  const workflow_id = query_params.workflow_id as string | undefined
  const filters = workflow_id ? { workflow_id } : {}
  const tasks = await cockpit.fetchDoneActivitiesForActor(actor_data, filters)
  res.status(200).json(tasks.map((task: any) => serializeTask(task)))
  return next()
}

export async function fetchActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("Called fetchActivity")
  const cockpit = getCockpit()
  const actor_data = req.state?.actor_data
  const process_id = req.params.id
  const process = await cockpit.fetchProcess(process_id)
  let tasks
  if (process) {
    switch (process._current_status) {
      case "running":
      case "delegated":
      case "pending":
      case "waiting":
        tasks = await cockpit.fetchAvailableActivityForProcess(process_id, actor_data)
        if (tasks) {
          res.status(200).json({ ...tasks })
        }
        else {
          res.status(204).json({ current_status: process._current_status })
        }
        return next()
      default:
        logger.warn(`Inactive status for PID ${process_id}`)
        res.status(404).json({ current_status: process._current_status })
    }
  }
  else {
    logger.warn(`No process found for PID ${process_id}`)
    res.status(404).json({ message: `No process found for PID ${process_id}` })
  }
  return next()
}

export async function fetchActivityByActivityManagerId(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("Called fetchActivityByActivityManagerId")
  const engine = getEngine()
  const actor_data = req.state?.actor_data
  const activity_manager_id = req.params.id
  const tasks = await engine.fetchActivityManager(activity_manager_id, actor_data)
  if (tasks) {
    res.status(200).json(tasks)
  }
  else {
    res.status(404).send()
  }
  return next()
}

export async function commitActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("Called commitActivity")
  const cockpit = getCockpit()
  const actor_data = req.state?.actor_data
  const process_id = req.params.id
  const external_input = req.body
  const tasks = await cockpit.commitActivity(process_id, actor_data, external_input)
  if (tasks.error) {
    switch (tasks.error.errorType) {
      case "activityManager":
        res.status(404).json(tasks.error)
        break
      case "commitActivity":
        res.status(400).json(tasks.error)
        logger.info("invalid attempt to commit activity, error: ", tasks.error.message)
        break
      default:
        res.status(500).json(tasks.error)
        break
    }
  }
  else {
    res.status(200).json(tasks)
  }
  return next()
}

export async function pushActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("Called pushActivity")
  const cockpit = getCockpit()
  const actor_data = req.state?.actor_data
  const process_id = req.params.id
  const response = await cockpit.pushActivity(process_id, actor_data)
  if (response && !response.error) {
    res.status(202).send()
  }
  else {
    switch (response.error.errorType) {
      case "activityManager":
        res.status(404).json(response.error)
        break
      default:
        res.status(500).json(response.error)
        break
    }
  }
  return next()
}

export async function commitByActivityManagerId(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("Called commitByActivityManagerId")
  const actor_data = req.state?.actor_data
  const engine = getEngine()
  const activity_manager_id = req.params.id
  const activity_manager = await engine.fetchActivityManager(activity_manager_id, actor_data)
  if (activity_manager) {
    logger.debug("PID: ", activity_manager.process_id)
    const cockpit = getCockpit()
    const process_id = activity_manager.process_id
    const external_input = req.body
    const tasks = await cockpit.commitActivity(process_id, actor_data, external_input)
    if (tasks.error) {
      switch (tasks.error.errorType) {
        case "activityManager":
          res.status(404).json(tasks.error)
          break
        case "commitActivity":
          res.status(400).json(tasks.error)
          logger.info("invalid attempt to commit activity, error: ", tasks.error.message)
          break
        default:
          res.status(500).json(tasks.error)
          break
      }
    }
    else {
      res.status(200).json(tasks)
    }
  }
  else {
    res.status(404).json({ message: "No activity manager found" })
  }
  return next()
}

export async function submitByActivityManagerId(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.verbose("Called submitByActivityManagerId")
  const actor_data = req.state?.actor_data
  const engine = getEngine()
  const activity_manager_id = req.params.id
  const external_input = req.body
  const result = await engine.submitByActivityManagerId(activity_manager_id, actor_data, external_input)
  if (result && !result.error) {
    res.status(200).json(result)
  }
  else if (result && result.error) {
    res.status(400).json(result.error)
  }
  else {
    res.status(404).json({ message: "No activity manager found" })
  }
  return next()
}
