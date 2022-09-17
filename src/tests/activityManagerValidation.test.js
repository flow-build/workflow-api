require("dotenv").config();
const axios = require("axios");
const { db } = require("./utils/db");
const { startServer } = require("../app");
const { delay, cleanDb } = require("./utils/auxiliar");
const { config } = require("./utils/requestConfig");

//ENGINE DEPS
const { setEngine, setCockpit } = require("../engine");
const { Engine, Cockpit } = require("@flowbuild/engine");
const engine = new Engine("knex", db);
const cockpit = new Cockpit("knex", db);
setEngine(engine);
setCockpit(cockpit);

//SAMPLES
const activitySchemaValidation = require("../samples/blueprints/activitySchemaValidation");

let server;
let activityManagerId;

beforeAll(async () => {
  server = startServer(3001);
  axios.defaults.baseURL = config.baseURL;
  axios.defaults.headers = config.headers;
  axios.defaults.validateStatus = config.validateStatus;

  await cleanDb();

  //CRIAR O WORKFLOW
  await axios.post("/workflows", activitySchemaValidation);
});

beforeEach(async () => {
  //INICIAR O PROCESSO
  const process = await axios.post(
    `/workflows/name/${activitySchemaValidation.name}/start`,
    {}
  );
  const processId = process.data.process_id;
  await delay(1500);
  console.log(`PID ${processId}`);    
  //OBTER O ID DO ACTIVITY_MANAGER
  const activityManager = await axios.get(`/processes/${processId}/activity`);
  console.log(`AMID ${activityManager.data.id}`);
  activityManagerId = activityManager.data.id;
});

afterAll(async () => {
  cleanDb();
  db.destroy();
  server.close();
});

describe("Validation @ POST activity_manager/:id/submit", () => {
  test.each([
    {},
    {
      date: 1
    },
    {
      date: 'whatever'
    },
    {
      date: '2020-30-05'
    },
    {
      date: '2020-19-05'
    },
  ])("Should return 400 for an invalid date", async (payload) => {
    let response = await axios.post(`activity_manager/${activityManagerId}/submit`, payload);
    expect(response.status).toEqual(400);
  });

  test("Should return 202 for a valid date", async () => {
    const payload = { date: '2021-09-15' };

    let response = await axios.post(`activity_manager/${activityManagerId}/submit`, payload);
    console.log(response)
    expect(response.status).toBe(202);
  });
});

describe("Validation @ POST activity_manager/:id/commit", () => {
  test.each([
    {},
    {
      date: 1
    },
    {
      date: 'whatever'
    },
    {
      date: '2020-30-05'
    },
    {
      date: '2020-19-05'
    },
  ])("Should return 400 for an invalid date", async (payload) => {
    let response = await axios.post(`activity_manager/${activityManagerId}/commit`, payload);
    expect(response.status).toEqual(400);
  });

  test("Should return 200 for a valid date", async () => {
    const payload = { date: '2021-09-15' };

    let response = await axios.post(`activity_manager/${activityManagerId}/commit`, payload);
    console.log(response)
    expect(response.status).toBe(200);
  });
});