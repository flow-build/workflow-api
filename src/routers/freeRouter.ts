import { healthcheck } from "../controllers/healthcheck"
import { get } from "../controllers/token"

import { Router } from "express"

const router = Router()

router.get("/", healthcheck)
router.get("/healthcheck", healthcheck)
router.get("/token", get)

export default router
