require("dotenv").config();
const { v1: uuid } = require("uuid");
const axios = require("axios");
const { db } = require("./utils/db");
const { startServer } = require("../app");
const workflowSamples = require("../samples/workflows");
const { delay, cleanDb } = require("./utils/auxiliar");
const { config } = require("./utils/requestConfig");
const { World } = require("./utils/world");

const { tearDownEnvironment, createTestEngine, createTestCockpit } = require("./utils/fixtures");

const logger = (...args) => process.env.TESTS_VERBOSE ? logger(...args) : undefined

const world = new World({
  baseUrl: config.baseURL,
  headers: config.headers 
})

let server;
const prefix = "/activity_manager";
let processId;
let activityManagerId;

beforeAll(async () => {
  process.env.ENGINE_HEARTBEAT=false
  createTestEngine(db);
  createTestCockpit(db);

  server = startServer(3001);
  axios.defaults.baseURL = config.baseURL;
  axios.defaults.headers = config.headers;
  axios.defaults.validateStatus = config.validateStatus;
  jest.setTimeout(30000);

  await cleanDb();
  await axios.post("/workflows", workflowSamples.singleUserTask);
});

beforeEach(async () => {
  //INICIAR UM PROCESSO E GUARDAR O ID DO PROCESSO
  const process = await axios.post(`/workflows/name/${workflowSamples.singleUserTask.name}/start`, {});
  processId = process.data.process_id;
  await world.waitProcessStop(processId);
  //OBTER O ID DO ACTIVITY_MANAGER
  const activityManager = await axios.get(`/processes/${processId}/activity`);
  logger(`AMID ${activityManager.data.id}`);
  activityManagerId = activityManager.data.id;
});

afterAll(async () => tearDownEnvironment(server, db));

describe("POST /:id/commit", () => {
  test("should return 200 for existing id and should not affect the process status", async () => {
    logger("should return 200 for existing id and should not affect the process status");
    const commitCall = await axios.post(`${prefix}/${activityManagerId}/commit`);
    expect(commitCall.status).toBe(200);

    const response = await axios.get(`/processes/${processId}/state`);
    expect(response.data.state.status).toBe("waiting");
  });

  test("should keep returning 200 for an existing id previous committed", async () => {
    logger("should keep returning 200 for an existing id previous committed");
    const firstCall = await axios.post(`${prefix}/${activityManagerId}/commit`);
    expect(firstCall.status).toBe(200);

    const secondCall = await axios.post(`${prefix}/${activityManagerId}/commit`);
    expect(secondCall.status).toBe(200);
  });

  test("should return 404 for an random non-existing id", async () => {
    logger("should return 404 for an random non-existing id");
    const randomId = uuid();
    const commitCall = await axios.post(`${prefix}/${randomId}/commit`);
    expect(commitCall.status).toBe(404);
  });
});
describe("POST /:id/submit", () => {
  test("should return 202 for existing id and should affect the process status", async () => {
    logger("should return 202 for existing id and should affect the process status");
    const submitCall = await axios.post(`${prefix}/${activityManagerId}/submit`);
    expect(submitCall.status).toBe(202);
    await delay(1500);
    const response = await axios.get(`/processes/${processId}/state`);
    expect(response.data.state.status).toBe("finished");
  });

  test("should return 422 for an existing id already submitted", async () => {
    logger("should return 422 for an existing id already submitted");
    const firstCall = await axios.post(`${prefix}/${activityManagerId}/submit`);
    expect(firstCall.status).toBe(202);

    const secondCall = await axios.post(`${prefix}/${activityManagerId}/submit`);
    expect(secondCall.status).toBe(422);
  });

  test("should return 422 for an id from a interrupted process", async () => {
    logger("should return 422 for an id from a interrupted process");
    await axios.post(`/processes/${processId}/abort`);
    const firstCall = await axios.post(`${prefix}/${activityManagerId}/submit`);
    expect(firstCall.status).toBe(422);
  });

  test("should return 404 for an random non-existing id", async () => {
    logger("should return 404 for an random non-existing id");
    const randomId = uuid();
    const commitCall = await axios.post(`${prefix}/${randomId}/submit`);
    expect(commitCall.status).toBe(404);
  });
});
