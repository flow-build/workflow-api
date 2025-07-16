import { setCustomNodes } from "../src/nodes"

import { envs } from "./config/env"
import { setPersist } from "./middlewares/persist"
import { captureUserAgentAndIp } from "./middlewares/userAgent"
import cockpitRouter from "./routers/cockpitRouter"
import freeRouter from "./routers/freeRouter"
import mainRouter from "./routers/mainRouter"
import * as broker from "./services/broker"
import * as cockpitService from "./services/cockpit"
import { db } from "./utils/db"
import { activateNotifiers } from "./utils/engineListener"
import { startLogger } from "./utils/engineLogger"
import { jwtAlgorithms, jwtPassthrough, jwtSecret } from "./utils/jwtSecret"
import { logger as _log } from "./utils/logger"
import { getCockpit, getEngine, setCockpit, setEngine } from "./engine"

import { Cockpit, Engine } from "@flowbuild/engine"
import cors from "cors"
import express, { Application } from "express"
import { expressjwt } from "express-jwt"
import helmet from "helmet"

const app: Application = express()
app.use(helmet())
app.use(setPersist(db))
app.use(captureUserAgentAndIp)

const engineLogLevel = envs.FLOWBUILD.LOGS.LOG_LEVEL

startLogger()

let engine = getEngine()
if (!engine) {
  engine = new Engine("knex", db, engineLogLevel)
  setEngine(engine)
}
let cockpit = getCockpit()
if (!cockpit) {
  cockpit = new Cockpit("knex", db, engineLogLevel)
  setCockpit(cockpit)
  cockpitService.setDbConnection(db)
}
setCustomNodes()

broker.connect()

activateNotifiers(engine)

const crypto = engine.buildCrypto("aes-256-cbc", {
  key: process.env.CRYPTO_KEY || "12345678901234567890123456789012"
})
engine.setCrypto(crypto)

const corsOptions = {
  origin: "*",
  allowMethods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
  allowHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "x-duration",
    "x-secret"
  ],
  exposedHeaders: ["forbbiden-reason"]
}

app.disable("x-powered-by")
app.use(cors(corsOptions))
app.use(express.json())

app.use(freeRouter)

app.use(
  expressjwt({
    credentialsRequired: jwtPassthrough,
    secret: jwtSecret,
    algorithms: [jwtAlgorithms]
  })
)

app.use(mainRouter)
app.use("/cockpit", cockpitRouter)

export default app
