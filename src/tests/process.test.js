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
let basicWorkflowId;
let singleUserTaskWorkflowId;
const prefix = "/processes";
const numProcesses = 2;

beforeAll(async () => {
  server = startServer(3001);
  axios.defaults.baseURL = config.baseURL;
  axios.defaults.headers = config.headers;
  axios.defaults.validateStatus = config.validateStatus;
  jest.setTimeout(30000);

  await cleanDb();

  let workflow = await axios.post("/workflows", workflowSamples.basicStartFinish);
  basicWorkflowId = workflow.data.workflow_id;
  workflow = await axios.post("/workflows", workflowSamples.singleUserTask);
  singleUserTaskWorkflowId = workflow.data.workflow_id;
  await axios.post("/workflows", workflowSamples.timerProcess);
  for (let i = 0; i < numProcesses; i++) {
    await axios.post(`/workflows/name/${workflowSamples.basicStartFinish.name}/start`, {});
    await axios.post(`/workflows/name/${workflowSamples.singleUserTask.name}/start`, {});
  }
});

beforeEach(async () => {
  await delay(500);
});

afterAll(async () => {
  await cleanDb();
  await db.destroy();
  server.close();
});

describe("GET /", () => {
  const route = `${prefix}/`;

  test("should return 200 and all processes", async () => {
    const response = await axios.get(route);
    expect(response.status).toBe(200);
    expect(response.data).toHaveLength(2 * numProcesses);
  });

  test("should filter by workflow_id accordingly", async () => {
    const params = new URLSearchParams();
    params.append("workflow_id", basicWorkflowId);
    const response = await axios.get(`/processes/?workflow_id=${basicWorkflowId}`);
    expect(response.status).toBe(200);

    const processes = response.data;
    expect(processes).toHaveLength(numProcesses);
  });
});

describe("GET /available", () => {
  const route = `${prefix}/available`;

  test("should return 200", async () => {
    const response = await axios.get(route);
    expect(response.status).toBe(200);
    expect(response.data).toHaveLength(numProcesses);
  });
});

describe("GET /done", () => {
  const route = `${prefix}/done`;

  beforeEach(async () => {
    const process = await axios.post(`/workflows/name/${workflowSamples.singleUserTask.name}/start`, {});
    await delay(500);
    processId = process.data.process_id;
  });

  test("should return 200 and no task", async () => {
    const response = await axios.get(route);
    expect(response.status).toBe(200);
    expect(response.data).toHaveLength(0);
  });

  test("should return 200 and show 1 done task", async () => {
    await axios.post(`${prefix}/${processId}/commit`);
    await axios.post(`${prefix}/${processId}/push`);

    const response = await axios.get(route);
    expect(response.status).toBe(200);
    expect(response.data).toHaveLength(1);
  });
});

describe("GET /:id/state", () => {
  let processId;

  beforeEach(async () => {
    const process = await axios.post(`/workflows/name/${workflowSamples.singleUserTask.name}/start`, {});
    await delay(500);
    processId = process.data.process_id;
  });

  test("should return 200 for existing process", async () => {
    const response = await axios.get(`${prefix}/${processId}/state`);
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.workflow_id).toBe(singleUserTaskWorkflowId);
  });

  test("should return 404 for non existing process", async () => {
    const randomId = uuid();
    const response = await axios.get(`${prefix}/${randomId}/state`);
    expect(response.status).toBe(404);
  });
});

describe("GET /:id/history", () => {
  let processId;

  beforeEach(async () => {
    const process = await axios.post(`/workflows/name/${workflowSamples.basicStartFinish.name}/start`, {});
    await delay(500);
    processId = process.data.process_id;
  });

  test("should return 200 for existing process", async () => {
    const response = await axios.get(`${prefix}/${processId}/history`);
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data).toHaveLength(3);
  });

  test("should return 404 for non existing process", async () => {
    const randomId = uuid();
    const response = await axios.get(`${prefix}/${randomId}/history`);
    expect(response.status).toBe(404);
  });
});

describe("GET /:id/activity", () => {
  let processId;

  beforeEach(async () => {
    //INICIAR UM PROCESSO E GUARDAR O ID DO PROCESSO
    const process = await axios.post(`/workflows/name/${workflowSamples.singleUserTask.name}/start`, {});
    await delay(500);
    processId = process.data.process_id;
  });

  test("should return 200 for existing id", async () => {
    const call = await axios.get(`${prefix}/${processId}/activity`);
    expect(call.status).toBe(200);
    expect(call.data.id).toBeDefined();
  });

  test("should return 404 for a non-existing id", async () => {
    const randomId = uuid();
    const call = await axios.get(`${prefix}/${randomId}/activity`);
    expect(call.status).toBe(404);
  });

  test("should return 204 for a non-waiting processId", async () => {
    const process = await axios.post(`/workflows/name/${workflowSamples.timerProcess.name}/start`, {});
    processId = process.data.process_id;
    await delay(500);
    const call = await axios.get(`${prefix}/${processId}/activity`);
    expect(call.status).toBe(204);
  });
});

describe("GET /activityManager/:id", () => {
  let processId;
  let activityManagerId;

  beforeEach(async () => {
    //INICIAR UM PROCESSO E GUARDAR O ID DO PROCESSO
    const process = await axios.post(`/workflows/name/${workflowSamples.singleUserTask.name}/start`, {});
    await delay(500);
    processId = process.data.process_id;
    //OBTER O ID DO ACTIVITY_MANAGER
    const activityManager = await axios.get(`/processes/${processId}/activity`);
    activityManagerId = activityManager.data.id;
  });

  test("should return 200 for existing id", async () => {
    const call = await axios.get(`${prefix}/activityManager/${activityManagerId}`);
    expect(call.status).toBe(200);
    expect(call.data.id).toBeDefined();
  });

  test("should return 404 for a non-existing id", async () => {
    const randomId = uuid();
    const call = await axios.get(`${prefix}/activityManager/${randomId}`);
    expect(call.status).toBe(404);
  });
});

describe("POST /:id/run", () => {
  let processId;

  beforeEach(async () => {
    const process = await axios.post(`/workflows/${singleUserTaskWorkflowId}/create`, {});
    processId = process.data.process_id;
  });

  test("should return 200 for existing process", async () => {
    const firstCall = await axios.get(`${prefix}/${processId}/state`);
    expect(firstCall.data.current_status).toBe("unstarted");

    const firstRunCall = await axios.post(`${prefix}/${processId}/run`);
    expect(firstRunCall.status).toBe(200);

    const secondCall = await axios.get(`${prefix}/${processId}/state`);
    expect(secondCall.data.current_status).toBe("waiting");

    const secondRunCall = await axios.post(`${prefix}/${processId}/run`);
    expect(secondRunCall.status).toBe(200);

    const thirdCall = await axios.get(`${prefix}/${processId}/state`);
    expect(thirdCall.data.current_status).toBe("finished");
  });

  test("should return 404 for non existing process", async () => {
    const randomId = uuid();
    const response = await axios.post(`${prefix}/${randomId}/run`);
    expect(response.status).toBe(404);
  });
});

describe("POST /:id/abort", () => {
  let processId;

  beforeEach(async () => {
    const process = await axios.post(`/workflows/${basicWorkflowId}/create`, {});
    processId = process.data.process_id;
  });

  test("should return 200 and the process should be interrupted", async () => {
    const firstCall = await axios.get(`${prefix}/${processId}/state`);
    expect(firstCall.data.current_status).toBe("unstarted");

    const response = await axios.post(`${prefix}/${processId}/abort`);
    expect(response.status).toBe(200);

    const secondCall = await axios.get(`${prefix}/${processId}/state`);
    expect(secondCall.data.current_status).toBe("interrupted");
  });

  test("should return 422 if the process is already stopped", async () => {});

  test("should return 404 for non existing process", async () => {
    const randomId = uuid();
    const response = await axios.post(`${prefix}/${randomId}/abort`);
    expect(response.status).toBe(404);
  });
});

describe("POST /:id/commit", () => {
  let processId;

  beforeEach(async () => {
    const process = await axios.post(`/workflows/name/${workflowSamples.singleUserTask.name}/start`, {});
    await delay(500);
    processId = process.data.process_id;
  });

  test("should return 200 for existing process and should not affect the process status", async () => {
    const firstCall = await axios.get(`${prefix}/${processId}/state`);
    expect(firstCall.data.current_status).toBe("waiting");

    const commitCall = await axios.post(`${prefix}/${processId}/commit`);
    expect(commitCall.status).toBe(200);

    const response = await axios.get(`${prefix}/${processId}/state`);
    expect(response.data.current_status).toBe("waiting");
  });

  test("should return 404 for non existing process", async () => {
    const randomId = uuid();
    const response = await axios.post(`${prefix}/${randomId}/commit`);
    expect(response.status).toBe(404);
  });
});

describe("POST /:id/push", () => {
  let processId;

  beforeEach(async () => {
    const process = await axios.post(`/workflows/name/${workflowSamples.singleUserTask.name}/start`, {});
    await delay(500);
    processId = process.data.process_id;
  });

  test("should return 200 for existing process and should affect the process status", async () => {
    const firstCall = await axios.get(`${prefix}/${processId}/state`);
    expect(firstCall.data.current_status).toBe("waiting");

    const commitCall = await axios.post(`${prefix}/${processId}/commit`);
    expect(commitCall.status).toBe(200);

    const pushCall = await axios.post(`${prefix}/${processId}/push`);
    expect(pushCall.status).toBe(202);
    await delay(500);

    const response = await axios.get(`${prefix}/${processId}/state`);
    expect(response.data.current_status).not.toBe("waiting");
  });
});

describe("GET /:id/state/find", () => {
  let processId;

  beforeEach(async () => {
    const process = await axios.post(`/workflows/name/${workflowSamples.singleUserTask.name}/start`, {});
    await delay(500);
    processId = process.data.process_id;
  });

  test("should return 400 if no parameters where provided", async () => {
    const randomId = uuid();
    const response = await axios.get(`${prefix}/${randomId}/state/find`);
    expect(response.status).toBe(400);
  });

  test("should return 200 for existing process and stepNumber", async () => {
    const response = await axios.get(`${prefix}/${processId}/state/find?stepNumber=1`);
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.environment).toBeDefined();
    expect(response.data.states).toBeDefined();
    expect(response.data.states).toHaveLength(1);
  });

  test("should return 200 for existing process and start nodeId", async () => {
    const response = await axios.get(`${prefix}/${processId}/state/find?nodeId=1`);
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.environment).toBeDefined();
    expect(response.data.states).toBeDefined();
    expect(response.data.states).toHaveLength(2);
  });

  test("if both parameters where provided, stepNumber should take precedence", async () => {
    const response = await axios.get(`${prefix}/${processId}/state/find?stepNumber=1&nodeId=2`);
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.environment).toBeDefined();
    expect(response.data.states).toBeDefined();
    expect(response.data.states).toHaveLength(1);
  });

  test("should return 404 for non existing process", async () => {
    const randomId = uuid();
    const response = await axios.get(`${prefix}/${randomId}/state/find?stepNumber=8`);
    expect(response.status).toBe(404);
  });

  test("should return 404 for if no state were found", async () => {
    const randomId = uuid();
    const response = await axios.get(`${prefix}/${randomId}/state/find?stepNumber=8`);
    expect(response.status).toBe(404);
  });
});