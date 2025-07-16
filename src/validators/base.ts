import { logger } from "../utils/logger"

import "../types/express"
import Ajv, { ErrorObject, JSONSchemaType } from "ajv"
import addFormats from "ajv-formats"
import type { NextFunction, Request, Response } from "express"
import { validate } from "uuid"

export function validateBodyWithSchema<T>(schema: JSONSchemaType<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    logger.debug("[validators base] called validateBodySchema")
    const _ajv = new Ajv({ allErrors: true, allowUnionTypes: true })
    addFormats(_ajv)
    const validateSchema = _ajv.compile(schema)
    if (!validateSchema) throw new Error("No schema")
    const is_valid = await validateSchema(req.body)
    if (!is_valid) {
      logger.debug("invalid schema # %i errors", validateSchema.errors?.length)
      res.status(400).send({
        message: "Invalid Request Body",
        error: validateSchema.errors?.map((e) => {
          return {
            field: e.instancePath,
            message: e.message
          }
        })
      })
      return
    }
    return next()
  }
};

export type ValidateOutput = {
  isValid: boolean
  errors?: ErrorObject<string, Record<string, any>, unknown>[] | null
}

export async function validateDataWithSchema<T>(schema: JSONSchemaType<T>, data: Record<string, unknown>): Promise<ValidateOutput> {
  logger.silly("[validators base] called validateSchema")
  const _ajv = new Ajv({ allErrors: true })
  addFormats(_ajv)
  const validateSchema = _ajv.compile(schema)
  const is_valid = await validateSchema(data)
  return {
    isValid: is_valid,
    errors: validateSchema.errors
  }
};

export async function validateUUID(req: Request, res: Response, next: NextFunction) {
  logger.debug(`[validators base] called validateUUID`)
  const id = req.params.id || req.query.workflow_id
  if (id) {
    const is_valid = validate(id)
    if (!is_valid) {
      res.status(400).send({ message: "Invalid uuid" })
      return
    }
  }
  return next()
};
