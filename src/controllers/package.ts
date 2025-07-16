import { getCockpit } from "../engine"
import { logger } from "../utils/logger"

import type { NextFunction, Request, Response } from "express"

/**
 * Save a new package.
 */
export async function savePackage(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.debug("called savePackage")
  const cockpit = getCockpit()
  const input_package = req.body
  try {
    const package_ = await cockpit.savePackage(
      input_package.name,
      input_package.description,
      input_package.code
    )
    res.status(201).json({
      package_id: package_.id,
      package_url: `${req.headers.host}${req.baseUrl}/${package_.id}`
    })
  }
  catch (err) {
    res.status(400).json({ error: err })
  }
  return next()
}

/**
 * Fetch a package by ID.
 */
export async function fetchPackage(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.debug("called fetchPackage")
  const cockpit = getCockpit()
  const package_id = req.params.id
  const package_ = await cockpit.fetchPackage(package_id)
  if (package_) {
    res.status(200).json(package_.serialize())
  }
  else {
    res.status(404).end()
  }
  return next()
}

/**
 * Delete a package by ID.
 */
export async function deletePackage(req: Request, res: Response, next: NextFunction): Promise<void> {
  logger.debug("called deletePackage")
  const cockpit = getCockpit()
  const package_id = req.params.id
  const num_deleted = await cockpit.deletePackage(package_id)
  if (num_deleted === 0) {
    res.status(404).end()
  }
  else {
    res.status(202).json({
      deleted: num_deleted
    })
  }
  return next()
}
