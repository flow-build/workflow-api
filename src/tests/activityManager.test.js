require("dotenv").config();
const { v1: uuid } = require("uuid");
const axios = require("axios");
const { db } = require("./utils/db");
const { startServer } = require("../app");
const workflowSamples = require("../samples/workflows");
const { delay, cleanDb } = require("./utils/auxiliar");
const { config } = require("./utils/requestConfig");
const { setEngine, setCockpit } = require("../engine");
const { Engine, Cockpit } = require("@flowbuild/engine");
const engine = new Engine("knex", db);
const cockpit = new Cockpit("knex", db);
setEngine(engine);
setCockpit(cockpit);

let server;
const prefix = "/activity_manager";

beforeAll(async () => {
  process.env.ENGINE_HEARTBEAT=false
  server = startServer(3001);
  axios.defaults.baseURL = config.baseURL;
  axios.defaults.headers = config.headers;
  axios.defaults.validateStatus = config.validateStatus;
  jest.setTimeout(30000);

  await cleanDb();
  await axios.post("/workflows", workflowSamples.singleUserTask);
});

beforeEach(async () => {
  await delay(500);
});

afterAll(async () => {
  cleanDb();
  db.destroy();
  server.close();
});

describe("POST /:id/commit", () => {
  let processId;
  let activityManagerId;

  beforeEach(async () => {
    //INICIAR UM PROCESSO E GUARDAR O ID DO PROCESSO
    const process = await axios.post(`/workflows/name/${workflowSamples.singleUserTask.name}/start`, {});
    await delay(1500);
    processId = process.data.process_id;
    //OBTER O ID DO ACTIVITY_MANAGER
    const activityManager = await axios.get(`/processes/${processId}/activity`);
    console.log(`AMID ${activityManager.data.id}`);
    activityManagerId = activityManager.data.id;
  });

  test("should return 200 for existing id and should not affect the process status", async () => {
    console.log("should return 200 for existing id and should not affect the process status");
    const commitCall = await axios.post(`${prefix}/${activityManagerId}/commit`);
    expect(commitCall.status).toBe(200);

    const response = await axios.get(`/processes/${processId}/state`);
    expect(response.data.state.status).toBe("waiting");
  });

  test("should keep returning 200 for an existing id previous committed", async () => {
    console.log("should keep returning 200 for an existing id previous committed");
    const firstCall = await axios.post(`${prefix}/${activityManagerId}/commit`);
    expect(firstCall.status).toBe(200);

    const secondCall = await axios.post(`${prefix}/${activityManagerId}/commit`);
    expect(secondCall.status).toBe(200);
  });

  test("should return 404 for an random non-existing id", async () => {
    console.log("should return 404 for an random non-existing id");
    const randomId = uuid();
    const commitCall = await axios.post(`${prefix}/${randomId}/commit`);
    expect(commitCall.status).toBe(404);
  });
});
describe("POST /:id/submit", () => {
  let processId;
  let activityManagerId;

  beforeEach(async () => {
    //INICIAR UM PROCESSO E GUARDAR O ID DO PROCESSO
    const process = await axios.post(`/workflows/name/${workflowSamples.singleUserTask.name}/start`, {});
    await delay(1500);
    processId = process.data.process_id;
    //OBTER O ID DO ACTIVITY_MANAGER
    const activityManager = await axios.get(`/processes/${processId}/activity`);
    console.log(`AMID ${activityManager.data.id}`);
    activityManagerId = activityManager.data.id;
  });

  test("should return 202 for existing id and should affect the process status", async () => {
    console.log("should return 202 for existing id and should affect the process status");
    const submitCall = await axios.post(`${prefix}/${activityManagerId}/submit`);
    expect(submitCall.status).toBe(202);
    await delay(1500);
    const response = await axios.get(`/processes/${processId}/state`);
    expect(response.data.state.status).toBe("finished");
  });

  test("should return 422 for an existing id already submitted", async () => {
    console.log("should return 422 for an existing id already submitted");
    const firstCall = await axios.post(`${prefix}/${activityManagerId}/submit`);
    expect(firstCall.status).toBe(202);

    const secondCall = await axios.post(`${prefix}/${activityManagerId}/submit`);
    expect(secondCall.status).toBe(422);
  });

  test("should return 422 for an id from a interrupted process", async () => {
    console.log("should return 422 for an id from a interrupted process");
    await axios.post(`/processes/${processId}/abort`);
    const firstCall = await axios.post(`${prefix}/${activityManagerId}/submit`);
    expect(firstCall.status).toBe(422);
  });

  test("should return 404 for an random non-existing id", async () => {
    console.log("should return 404 for an random non-existing id");
    const randomId = uuid();
    const commitCall = await axios.post(`${prefix}/${randomId}/submit`);
    expect(commitCall.status).toBe(404);
  });
});
