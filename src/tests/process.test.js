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
const { World } = require("./utils/world");
const engine = new Engine("knex", db);
const cockpit = new Cockpit("knex", db);
setEngine(engine);
setCockpit(cockpit);

let server;
let basicWorkflowId;
let singleUserTaskWorkflowId;
const prefix = "/processes";
const numProcesses = 2;
const world = new World({
  baseUrl: config.baseURL,
  headers: config.headers 
})

beforeAll(async () => {
  process.env.ENGINE_HEARTBEAT=false
  server = startServer(3001);
  axios.defaults.baseURL = config.baseURL;
  axios.defaults.headers = config.headers;
  axios.defaults.validateStatus = config.validateStatus;
  jest.setTimeout(50000);

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
  cleanDb();
  db.destroy();
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
    processId = process.data.process_id;
    await world.waitProcessStop(processId);
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
    expect(response.data.workflow.id).toBe(singleUserTaskWorkflowId);
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
    processId = process.data.process_id;
    await world.waitProcessStop(processId);
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
    processId = process.data.process_id;
    await world.waitProcessStop(processId);
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
    const process = await axios.post(`/workflows/name/${workflowSamples.timerProcess.name}/create`, {});
    processId = process.data.process_id;
    const call = await axios.get(`${prefix}/${processId}/activity`);
    expect(call.status).toBe(404);
    expect(call.data.current_status).toBeDefined();
  });
});

describe("GET /activityManager/:id", () => {
  let processId;
  let activityManagerId;

  beforeEach(async () => {
    //INICIAR UM PROCESSO E GUARDAR O ID DO PROCESSO
    const process = await axios.post(`/workflows/name/${workflowSamples.singleUserTask.name}/start`, {});
    processId = process.data.process_id;
    await world.waitProcessStop(processId);
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
    expect(firstCall.data.state.status).toBe("unstarted");

    const firstRunCall = await axios.post(`${prefix}/${processId}/run`);
    expect(firstRunCall.status).toBe(200);

    const secondCall = await axios.get(`${prefix}/${processId}/state`);
    expect(secondCall.data.state.status).toBe("waiting");

    const secondRunCall = await axios.post(`${prefix}/${processId}/run`);
    expect(secondRunCall.status).toBe(200);

    const thirdCall = await axios.get(`${prefix}/${processId}/state`);
    expect(thirdCall.data.state.status).toBe("finished");
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
    expect(firstCall.data.state.status).toBe("unstarted");

    const response = await axios.post(`${prefix}/${processId}/abort`);
    expect(response.status).toBe(200);

    const secondCall = await axios.get(`${prefix}/${processId}/state`);
    expect(secondCall.data.state.status).toBe("interrupted");
  });

  test("should return 422 if the process is already stopped", async () => {});

  test("should return 404 for non existing process", async () => {
    const randomId = uuid();
    const response = await axios.post(`${prefix}/${randomId}/abort`);
    expect(response.status).toBe(404);
  });
});

describe("Commit & Push", () => {
  let processId;

  beforeEach(async () => {
    const process = await axios.post(`/workflows/name/${workflowSamples.singleUserTask.name}/start`, {});
    processId = process.data.process_id;
    await world.waitProcessStop(processId);
  });

  describe("POST /:id/commit", () => {
    test("should return 200 for existing process and should not affect the process status", async () => {
      const firstCall = await axios.get(`${prefix}/${processId}/state`);
      expect(firstCall.data.state.status).toBe("waiting");

      const commitCall = await axios.post(`${prefix}/${processId}/commit`);
      expect(commitCall.status).toBe(200);

      const response = await axios.get(`${prefix}/${processId}/state`);
      expect(response.data.state.status).toBe("waiting");
    });

    test("should return 404 for non existing process", async () => {
      const randomId = uuid();
      const response = await axios.post(`${prefix}/${randomId}/commit`);
      expect(response.status).toBe(404);
    });
  });

  describe("POST /:id/push", () => {
    test("should return 200 for existing process and should affect the process status", async () => {
      const firstCall = await axios.get(`${prefix}/${processId}/state`);
      expect(firstCall.data.state.status).toBe("waiting");

      const commitCall = await axios.post(`${prefix}/${processId}/commit`);
      expect(commitCall.status).toBe(200);

      const pushCall = await axios.post(`${prefix}/${processId}/push`);
      expect(pushCall.status).toBe(202);
      await delay(1500);

      const response = await axios.get(`${prefix}/${processId}/state`);
      expect(response.data.state.status).not.toBe("waiting");
    });
  });
})