import fs from "fs"

import "../types/express"
import type { Request, Response } from "express"

export async function getSwagger(
  req: Request,
  res: Response
): Promise<void> {
  res.type("text/html; charset=utf-8")
  fs.createReadStream("public/swagger-ui/index.html").pipe(res)
}
