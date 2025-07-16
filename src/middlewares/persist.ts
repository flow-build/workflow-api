import "../types/express"
import type { NextFunction, Request, Response } from "express"

export function setPersist(persist: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.state) {
      req.state = {}
    }
    req.state.persist = persist
    return next()
  }
}
