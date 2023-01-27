require("dotenv").config();
const { v1: uuid } = require("uuid");
const axios = require("axios");
const { db } = require("./utils/db");
const { startServer } = require("../app");
const { tearDownEnvironment, createTestEngine, createTestCockpit } = require("./utils/fixtures");

const { setDbConnection } = require("../services/cockpit");
const { cleanDb, delay } = require("./utils/auxiliar");
const { config } = require("./utils/requestConfig");

//Samples
const basic = require("../samples/blueprints/basic");
const singleUserTask = require("../samples/blueprints/singleUserTask");
const notifyUserTask = require("../samples/blueprints/notifyUserTask");

//Schemas
const { validateDataWithSchema } = require("../validators/base");
const processExecution = require("../validators/schemas/processExecution");
const { World } = require("./utils/world");

const logger = (...args) => process.env.TESTS_VERBOSE ? logger(...args) : undefined

let server;
let basicProcessId;
let singleUserProcessId;
let notifyProcessId;
const world = new World({
  baseUrl: config.baseURL,
  headers: config.headers 
})

const prefix = "/cockpit";

beforeAll(async () => {
  createTestEngine(db);
  createTestCockpit(db);

  server = startServer(3001);
  axios.defaults.baseURL = `${config.baseURL}`;
  axios.defaults.headers = config.headers;
  axios.defaults.validateStatus = config.validateStatus;
  setDbConnection(db);

  await cleanDb();

  let response;
  await axios.post("/workflows", basic);
  await axios.post("/workflows", singleUserTask);
  await axios.post("/workflows", notifyUserTask);

  response = await axios.post(`/workflows/name/${basic.name}/start`, {});
  basicProcessId = response.data.process_id;
  logger('basicProcessId', basicProcessId)
  response = await axios.post(`/workflows/name/${singleUserTask.name}/start`, {});
  singleUserProcessId = response.data.process_id;
  logger('singleUserProcessId', singleUserProcessId)
  response = await axios.post(`/workflows/name/${notifyUserTask.name}/start`, {});
  notifyProcessId = response.data.process_id;
  logger('notifyProcessId', notifyProcessId)
});

afterAll(async () => tearDownEnvironment(server, db));

describe("GET /processes/:id/execution", () => {
  test("Should return 200", async () => {
    await world.waitProcessStop(basicProcessId);
    let response = await axios.get(`${prefix}/processes/${basicProcessId}/execution`);
    expect(response.status).toEqual(200);
    expect(response.data).toHaveLength(3);
    expect(response.data[0].step_number).toBe(3);
    const validation = await validateDataWithSchema(processExecution, response.data);
    expect(validation.is_valid).toBeTruthy();
  });

  test("Should return an empty array for a random uuid", async () => {
    const randomId = uuid();
    let response = await axios.get(`${prefix}/processes/${randomId}/execution`);
    expect(response.status).toEqual(200);
    expect(response.data).toHaveLength(0);
  });

  test("Should return 400 para an invalid uuid", async () => {
    const randomId = "not_a_uuid";
    let response = await axios.get(`${prefix}/processes/${randomId}/execution`);
    expect(response.status).toEqual(400);
    expect(response.data.message).toBe("Invalid uuid");
  });
});

describe("POST /processes/:id/state", () => {
  test("Should return 200 for a valid payload", async () => {
    const stateData = {
      bag: {
        bagKey: "bagValue",
      },
      result: {
        resultKey: "resultValue",
      },
      next_node_id: "2",
    };

    let response = await axios.post(`${prefix}/processes/${singleUserProcessId}/state`, stateData);
    expect(response.status).toEqual(200);
    expect(response.data.state.status).toBe("pending");
    expect(response.data.state.bag).toEqual(stateData.bag);
    expect(response.data.state.result).toEqual(stateData.result);
    expect(response.data.state.next_node_id).toEqual(stateData.next_node_id);
  });

  test.each([
    {},
    {
      bag: {},
      result: {},
      next_node_id: 99,
    },
    {
      bag: {},
      result: null,
      next_node_id: "99",
    },
    {
      bag: null,
      result: {},
      next_node_id: "99",
    },
    {
      bag: {},
      next_node_id: "99",
    },
    {
      result: {},
      next_node_id: "99",
    },
  ])("Should return 400 for a valid payload", async (payload) => {
    let response = await axios.post(`${prefix}/processes/${singleUserProcessId}/state`, payload);
    expect(response.status).toEqual(400);
    expect(response.data.message).toBe("Invalid Request Body");
  });
});

describe("POST /processes/:id/state/run", () => {
  test("Should return 200 for a valid processId at pending status", async () => {
    let response;
    let currentStep;

    response = await axios.get(`${prefix}/processes/${singleUserProcessId}/execution`);
    currentStep = response.data[0];
    expect(currentStep.step_number).toBe(4);
    expect(currentStep.status).toBe("pending");

    response = await axios.post(`${prefix}/processes/${singleUserProcessId}/state/run`);
    expect(response.status).toEqual(202);
    expect(response.data.message).toBe("process resumed, get process to check its current state");

    await delay(1000);
    response = await axios.get(`${prefix}/processes/${singleUserProcessId}/execution`);
    currentStep = response.data[0];
    expect(currentStep.step_number).toBeGreaterThan(4);
  });

  test("Should return 422 for a valid processId at a different status", async () => {
    let response;

    response = await axios.post(`${prefix}/processes/${singleUserProcessId}/state/run`);
    expect(response.status).toEqual(422);
    expect(response.data.message).toBe("Invalid process status");
  });

  test("Should return 404 for a random processId", async () => {
    const randomId = uuid();
    let response;

    response = await axios.post(`${prefix}/processes/${randomId}/state/run`);
    expect(response.status).toEqual(404);
    expect(response.data.message).toBe("No such process");
  });
});

describe("POST /processes/:id/set/:state_id", () => {
  let stateId;

  beforeAll(async () => {
    const response = await axios.get(`${prefix}/processes/${singleUserProcessId}/execution`);
    stateId = response.data.find((state) => state.step_number === 2).state_id;
  });

  test("Should return 200 for a correct data", async () => {
    await world.waitProcessStop(singleUserProcessId);
    let response;
    response = await axios.post(`${prefix}/processes/${singleUserProcessId}/set/${stateId}`);
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.message).toBe("to resume process execute a state run");
  });

  test("Should return 404 for a non-existent process_id", async () => {
    const randomId = uuid();
    let response;

    response = await axios.post(`${prefix}/processes/${randomId}/set/${stateId}`);
    expect(response.status).toEqual(404);
    expect(response.data.message).toBe("No such process");
  });

  test("Should return 404 for a non-existent state_id", async () => {
    const randomId = uuid();
    let response;

    response = await axios.post(`${prefix}/processes/${singleUserProcessId}/set/${randomId}`);
    expect(response.status).toEqual(404);
    expect(response.data.message).toBe("No such state");
  });

  test("Should return 400 for a incompatible state_id", async () => {
    let response;
    response = await axios.get(`${prefix}/processes/${notifyProcessId}/execution`);
    stateId = response.data.find((state) => state.step_number === 2).state_id;
    response = await axios.post(`${prefix}/processes/${singleUserProcessId}/set/${stateId}`);
    expect(response.status).toEqual(400);
    expect(response.data.message).toEqual("State incompatible to process");
  });
});