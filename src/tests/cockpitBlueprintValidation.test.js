require("dotenv").config();
const axios = require("axios");
const { db } = require("./utils/db");
const { startServer } = require("../app");
const workflowSamples = require("../samples/workflows");

const { cleanDb } = require("./utils/auxiliar");
const { config } = require("./utils/requestConfig");

const { setEngine, setCockpit } = require("../engine");
const { Engine, Cockpit } = require("@flowbuild/engine");
const { setDbConnection } = require("../services/cockpit");

const engine = new Engine("knex", db);
const cockpit = new Cockpit("knex", db);
setEngine(engine);
setCockpit(cockpit);

let server;

const prefix = "/cockpit";

beforeAll(async () => {
  server = startServer(3001);
  axios.defaults.baseURL = `${config.baseURL}`;
  axios.defaults.headers = config.headers;
  axios.defaults.validateStatus = config.validateStatus;
  setDbConnection(db);

  await cleanDb();

  let response;
  response = await axios.post("/workflows", workflowSamples.basicStartFinish);
  basicWorkflowId = response.data.workflow_id;
  response = await axios.post("/workflows", workflowSamples.singleUserTask);
  singleUserTaskWorkflowId = response.data.workflow_id;
});

afterAll(async () => {
  await cleanDb();
  await db.destroy();
  await server.close();
});

describe("POST /workflows/validate", () => {
  const route = `${prefix}/workflows/validate/`;

  test("Should return 200 for a valid blueprint", async () => {
    const response = await axios.post(route, workflowSamples.basicStartFinish);
    expect(response.status).toEqual(200);
    expect(response.data.message).toBe("Blueprint is valid");
  });

  test("Should return 400 for an invalid blueprint", async () => {
    const response = await axios.post(route, workflowSamples.invalidMissingNode);
    expect(response.status).toEqual(400);
    expect(response.data.message).toBe("Failed at are_all_nodes_present");
  });

  test("Should return 400 for an empty object", async () => {
    const payload = {
      name: "whatever",
      description: "whatever",
      blueprint_spec: {},
    };
    const response = await axios.post("/cockpit/workflows/validate", payload);
    expect(response.status).toEqual(400);
    expect(response.data.message).toBe("Invalid Request Body");
  });
});

describe("POST /workflows/compare", () => {
  test("Invalid Blueprint", async () => {});

  test("Same Blueprint", async () => {});

  test("Reorder Nodes should not invalidate", async () => {});

  test("Diferent Nodes", async () => {});

  test("Nonexistent workflow", async () => {});
});

describe("POST /workflows/update", () => {});
