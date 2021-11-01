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
  server = startServer(3001);
  axios.defaults.baseURL = config.baseURL;
  axios.defaults.headers = config.headers;
  axios.defaults.validateStatus = config.validateStatus;

  await cleanDb();

  workflow = await axios.post("/workflows", workflowSamples.singleUserTask);
  singleUserTaskWorkflowId = workflow.data.workflow_id;
});

beforeEach(async () => {
  await delay(500);
});

afterAll(async () => {
  await cleanDb();
  await db.destroy();
  Engine.kill();
  await server.close();
});

describe("POST /:id/commit", () => {
  let processId;
  let activityManagerId;

  beforeEach(async () => {
    //INICIAR UM PROCESSO E GUARDAR O ID DO PROCESSO
    const process = await axios.post(
      `/workflows/name/${workflowSamples.singleUserTask.name}/start`,
      {}
    );
    await delay(500);
    processId = process.data.process_id;
    //OBTER O ID DO ACTIVITY_MANAGER
    const activityManager = await axios.get(`/processes/${processId}/activity`);
    activityManagerId = activityManager.data.id;
  });

  test("should return 200 for existing id and should not affect the process status", async () => {
    const commitCall = await axios.post(
      `${prefix}/${activityManagerId}/commit`
    );
    expect(commitCall.status).toBe(200);

    const response = await axios.get(`/processes/${processId}/state`);
    expect(response.data.current_status).toBe("waiting");
  });

  test("should keep returning 200 for an existing id previous committed", async () => {
    const firstCall = await axios.post(`${prefix}/${activityManagerId}/commit`);
    expect(firstCall.status).toBe(200);

    const secondCall = await axios.post(
      `${prefix}/${activityManagerId}/commit`
    );
    expect(secondCall.status).toBe(200);
  });

  test("should return 404 for an random non-existing id", async () => {
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
    const process = await axios.post(
      `/workflows/name/${workflowSamples.singleUserTask.name}/start`,
      {}
    );
    await delay(500);
    processId = process.data.process_id;
    //OBTER O ID DO ACTIVITY_MANAGER
    const activityManager = await axios.get(`/processes/${processId}/activity`);
    activityManagerId = activityManager.data.id;
  });

  test("should return 202 for existing id and should affect the process status", async () => {
    const submitCall = await axios.post(
      `${prefix}/${activityManagerId}/submit`
    );
    expect(submitCall.status).toBe(202);
    await delay(500);
    const response = await axios.get(`/processes/${processId}/state`);
    expect(response.data.current_status).toBe("finished");
  });

  test("should return 422 for an existing id already submitted", async () => {
    const firstCall = await axios.post(`${prefix}/${activityManagerId}/submit`);
    expect(firstCall.status).toBe(202);

    const secondCall = await axios.post(
      `${prefix}/${activityManagerId}/submit`
    );
    expect(secondCall.status).toBe(422);
  });

  test("should return 422 for an id from a interrupted process", async () => {
    await axios.post(`/processes/${processId}/abort`);
    const firstCall = await axios.post(`${prefix}/${activityManagerId}/submit`);
    expect(firstCall.status).toBe(422);
  });

  test("should return 404 for an random non-existing id", async () => {
    const randomId = uuid();
    const commitCall = await axios.post(`${prefix}/${randomId}/submit`);
    expect(commitCall.status).toBe(404);
  });
});
