require("dotenv").config();
const { v1: uuid } = require("uuid");
const axios = require("axios");
const { db } = require("./utils/db");
const { startServer } = require("../app");
const { setEngine, setCockpit } = require("../engine");
const { Engine, Cockpit } = require("@flowbuild/engine");

const { setDbConnection } = require("../services/cockpit");
const { cleanDb, delay } = require("./utils/auxiliar");
const { config } = require("./utils/requestConfig");

//Samples
const basic = require("../samples/blueprints/basic");
const singleUserTask = require("../samples/blueprints/singleUserTask");
const notifyUserTask = require("../samples/blueprints/notifyUserTask");

//Schemas
const { validateDataWithSchema } = require("../validators/base");
const processState = require("../validators/schemas/processState");
const processExecution = require("../validators/schemas/processExecution");
const cockpitProcessesStates = require("../validators/schemas/cockpitProcessesStates");

const engine = new Engine("knex", db);
const cockpit = new Cockpit("knex", db);
setEngine(engine);
setCockpit(cockpit);

let server;
let basicProcessId;
let singleUserProcessId;
let notifyProcessId;

const prefix = "/cockpit";

beforeAll(async () => {
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
  response = await axios.post(`/workflows/name/${singleUserTask.name}/start`, {});
  singleUserProcessId = response.data.process_id;
  response = await axios.post(`/workflows/name/${notifyUserTask.name}/start`, {});
  notifyProcessId = response.data.process_id;
});

afterAll(async () => {
  await cleanDb();
  await db.destroy();
  await server.close();
});

describe("GET /processes/:id/execution", () => {
  test("Should return 200", async () => {
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

describe("GET /processes/:id/state/:node_id", () => {
  test("Should return 200", async () => {
    const nodeId = 2;
    let response = await axios.get(`${prefix}/processes/${basicProcessId}/state/${nodeId}`);
    expect(response.status).toEqual(200);
    expect(response.data).toHaveLength(1);
    expect(response.data[0].step_number).toBe(3);
    const validation = await validateDataWithSchema(cockpitProcessesStates, response.data);
    expect(validation.is_valid).toBeTruthy();
  });

  test("Should return an empty array for a random uuid", async () => {
    const randomId = uuid();
    const nodeId = 2;
    let response = await axios.get(`${prefix}/processes/${randomId}/state/${nodeId}`);
    expect(response.status).toEqual(404);
    expect(response.data.message).toBe("No such process");
  });

  test("Should return 400 para an invalid uuid", async () => {
    const randomId = "not_a_uuid";
    const nodeId = 2;
    let response = await axios.get(`${prefix}/processes/${randomId}/state/${nodeId}`);
    expect(response.status).toEqual(400);
    expect(response.data.message).toBe("Invalid uuid");
  });

  test("Should return 404 for a non existent node", async () => {
    const nodeId = 8;
    let response = await axios.get(`${prefix}/processes/${basicProcessId}/state/${nodeId}`);
    expect(response.status).toEqual(404);
    expect(response.data.message).toBe("No such node");
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

describe("GET /processes/state/:id", () => {
  let stateId;
  let route = `${prefix}/processes/state`;

  beforeAll(async () => {
    response = await axios.get(`${prefix}/processes/${basicProcessId}/execution`);
    stateId = response.data[0].state_id;
  });

  test("Should return 200", async () => {
    let response = await axios.get(`${route}/${stateId}`);
    expect(response.status).toEqual(200);
    expect(response.data.process_id).toBe(basicProcessId);
    let validation = await validateDataWithSchema(processState, response.data);
    expect(validation.is_valid).toBeTruthy();
  });

  test("Should return 204 for a random uuid", async () => {
    const randomId = uuid();
    let response = await axios.get(`${route}/${randomId}`);
    expect(response.status).toEqual(204);
  });

  test("Should return 400 for an invalid uuid", async () => {
    const randomId = "not_a_uuid";
    let response = await axios.get(`${route}/${randomId}`);
    expect(response.status).toEqual(400);
    expect(response.data.message).toBe("Invalid uuid");
  });
});
