require("dotenv").config();
const { v1: uuid } = require("uuid");
const axios = require("axios");
const { db } = require("./utils/db");
const { startServer } = require("../app");

const { cleanDb } = require("./utils/auxiliar");
const { config } = require("./utils/requestConfig");

const { setEngine, setCockpit } = require("../engine");
const { Engine, Cockpit } = require("@flowbuild/engine");
const { validateDataWithSchema } = require("../validators/base");
const { setDbConnection } = require("../services/cockpit");

//Samples
const workflowSamples = require("../samples/workflows");
const environmentVariables = require("../samples/blueprints/environmentVariables");

//Schemas
const processesStats = require("../validators/schemas/processesStats");
const cockpitListProcesses = require("../validators/schemas/cockpitListProcesses");
const processStateFromNode = require("../validators/schemas/processStateFromNode");

const engine = new Engine("knex", db);
const cockpit = new Cockpit("knex", db);
setEngine(engine);
setCockpit(cockpit);

let server;
const numProcesses = 2;

let basicWorkflowId;
let singleUserTaskWorkflowId;
const prefix = "/cockpit";

beforeAll(async () => {
  server = startServer(3001);
  axios.defaults.baseURL = `${config.baseURL}`;
  axios.defaults.headers = config.headers;
  axios.defaults.validateStatus = config.validateStatus;
  setDbConnection(db);

  jest.setTimeout(30000);
  await cleanDb();

  let response;
  response = await axios.post("/workflows", workflowSamples.basicStartFinish);
  basicWorkflowId = response.data.workflow_id;
  response = await axios.post("/workflows", workflowSamples.singleUserTask);
  singleUserTaskWorkflowId = response.data.workflow_id;
  await axios.post("/workflows", environmentVariables);

  for (let i = 0; i < numProcesses; i++) {
    await axios.post(`/workflows/name/${workflowSamples.basicStartFinish.name}/start`, {});
    await axios.post(`/workflows/name/${workflowSamples.singleUserTask.name}/start`, {});
    await axios.post(`/workflows/name/${workflowSamples.singleUserTask.name}/start`, {});
  }
});

afterAll(async () => {
  await cleanDb();
  await db.destroy();
  server.close();
});

describe("GET /workflows/stats", () => {
  const route = `${prefix}/workflows/stats`;

  test("Should return 200", async () => {
    const response = await axios.get(route);

    expect(response.status).toEqual(200);
    expect(response.data).toBeDefined();
    const workflows = Object.keys(response.data.workflows);
    expect(workflows).toHaveLength(3);
    const validation = await validateDataWithSchema(processesStats, response.data);
    expect(validation.is_valid).toBeTruthy();
  });

  test("Should filter according to provided workflow_id", async () => {
    const response = await axios.get(`${route}?workflow_id=${basicWorkflowId}`);

    expect(response.status).toEqual(200);
    expect(response.data.workflows).toBeDefined();
    expect(response.data.workflows[basicWorkflowId]).toBeDefined();
  });

  test("Should filter return an empty object for a random uuid", async () => {
    const randomId = uuid();

    const response = await axios.get(`${route}?workflow_id=${randomId}`);

    expect(response.status).toEqual(200);
    const workflows = Object.keys(response.data.workflows);
    expect(workflows).toHaveLength(0);
  });

  test("Should return 400 for a invalid uuid", async () => {
    const randomId = "not_a_uuid";

    const response = await axios.get(`${route}?workflow_id=${randomId}`);
    expect(response.status).toEqual(400);
  });

  test("Start_date filter works", async () => {
    const startDate = new Date();

    const response = await axios.get(`${route}?start_date=${startDate.toISOString()}`);

    expect(response.status).toEqual(200);
    const workflows = Object.keys(response.data.workflows);
    expect(workflows).toHaveLength(0);
  });
});

describe("GET /workflows/:id/processes", () => {
  const route = `${prefix}/workflows`;

  test("Should return 200 for an existing workflow_id", async () => {
    let response;

    response = await axios.get(`${route}/${basicWorkflowId}/processes`);
    expect(response.status).toEqual(200);
    expect(response.data).toHaveLength(2);
    const validation = await validateDataWithSchema(cockpitListProcesses, response.data);
    expect(validation.is_valid).toBeTruthy();

    response = await axios.get(`${prefix}/workflows/${singleUserTaskWorkflowId}/processes`);
    expect(response.status).toEqual(200);
    expect(response.data).toHaveLength(4);
  });

  test("Should return 404 for a random uuid", async () => {
    const randomId = uuid();

    const response = await axios.get(`${route}/${randomId}/processes`);
    expect(response.status).toEqual(404);
    expect(response.data.message).toBe("No such workflow");
  });

  test("Should return 400 for an invalid workflow_id ", async () => {
    const randomId = "not_a_uuid";

    const response = await axios.get(`${route}/${randomId}/processes`);
    expect(response.status).toEqual(400);
    expect(response.data.message).toBe("Invalid uuid");
  });
});

describe("GET /workflows/name/:name/processes", () => {
  const route = `${prefix}/workflows/name`;

  test("Should return 200", async () => {
    let response;

    response = await axios.get(`${route}/${workflowSamples.basicStartFinish.name}/processes`, {});
    expect(response.status).toEqual(200);
    expect(response.data).toHaveLength(2);
    const validation = await validateDataWithSchema(cockpitListProcesses, response.data);
    expect(validation.is_valid).toBeTruthy();

    response = await axios.get(`${route}/${workflowSamples.singleUserTask.name}/processes`, {});
    expect(response.status).toEqual(200);
    expect(response.data).toHaveLength(4);
  });

  test("Should return 404 for a non-existent workflow_name", async () => {
    const name = "whatever";

    let response = await axios.get(`${route}/${name}/processes`, {});
    expect(response.status).toEqual(404);
    expect(response.data.message).toBe("No such workflow");
  });

  test("Should return all versions", async () => {
    //publish version 2 for the same workflow
    await axios.post("/workflows", workflowSamples.singleUserTask);
    await axios.post(`/workflows/name/${workflowSamples.singleUserTask.name}/start`, {});

    const response = await axios.get(`${route}/${workflowSamples.singleUserTask.name}/processes`, {});
    expect(response.status).toEqual(200);
    expect(response.data).toHaveLength(5);
    const processesOfVersion1 = response.data.filter((process) => process.workflow_version === 1);
    const processesOfVersion2 = response.data.filter((process) => process.workflow_version === 2);
    expect(processesOfVersion1).toHaveLength(4);
    expect(processesOfVersion2).toHaveLength(1);
  });
});

describe("GET /workflows/name/:name/states/:node_id", () => {
  const route = `${prefix}/workflows/name`;

  test("Should return 200", async () => {
    let nodeId = "2";
    let response = await axios.get(`${route}/${workflowSamples.singleUserTask.name}/states/${nodeId}`, {});
    expect(response.status).toEqual(200);
    expect(response.data).toHaveLength(4);
    const validation = await validateDataWithSchema(processStateFromNode, response.data);
    expect(validation.is_valid).toBeTruthy();

    //StartNode should have 2 states for each process
    nodeId = "1";
    response = await axios.get(`${route}/${workflowSamples.singleUserTask.name}/states/${nodeId}`, {});
    expect(response.status).toEqual(200);
    expect(response.data).toHaveLength(9);
  });

  test("Should return an empty list for a non-existant node_id", async () => {
    let nodeId = "8";
    let response = await axios.get(`${route}/${workflowSamples.singleUserTask.name}/states/${nodeId}`, {});
    expect(response.status).toEqual(200);
    expect(response.data).toHaveLength(0);
  });

  test("Should return an empty list for a non-existant workflow_name", async () => {
    let workflow_name = "whatever";
    let nodeId = "2";
    let response = await axios.get(`${route}/${workflow_name}/states/${nodeId}`, {});
    expect(response.status).toEqual(200);
    expect(response.data).toHaveLength(0);
  });
});

describe("GET /workflows/variables", () => {
  const route = `${prefix}/workflows/variables/`;

  test("Should return 200", async () => {
    let response = await axios.get(route);
    expect(response.status).toEqual(200);
    expect(response.data["TEST_VARIABLE"]).toHaveLength(1);
  });
});
