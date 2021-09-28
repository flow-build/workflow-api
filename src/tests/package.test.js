require("dotenv").config();
const { v1: uuid } = require("uuid");
const axios = require("axios");
const { db } = require("./utils/db");
const { startServer } = require("../app");
const packageSamples = require("../samples/packages");
const { delay, cleanDb } = require("./utils/auxiliar");
const { config } = require("./utils/requestConfig");

const { setEngine, setCockpit } = require("../engine");
const { Engine, Cockpit } = require("@flowbuild/engine");
const engine = new Engine("knex", db);
const cockpit = new Cockpit("knex", db);
setEngine(engine);
setCockpit(cockpit);

let server;

beforeAll(() => {
  server = startServer(3001);
  axios.defaults.baseURL = `${config.baseURL}/packages`;
  axios.defaults.headers = config.headers;
  axios.defaults.validateStatus = config.validateStatus;
});

beforeEach(async () => {
  await delay(500);
});

afterEach(async () => {
  await db.delete().from("packages").where("name", "package_test_1");
});

afterAll(async () => {
  await cleanDb();
  await db.destroy();
  server.close();
});

describe("POST /", () => {
  test("should return 201 for valid input", async () => {
    const response = await axios.post("/", packageSamples.dummy);
    expect(response.status).toBe(201);
    expect(response.data.package_id).toBeDefined();
    expect(response.data.package_url).toBeDefined();
  });

  test("should return 400 for repeated input", async () => {
    await axios.post("/", packageSamples.dummy);
    const response = await axios.post("/", packageSamples.dummy);
    expect(response.status).toBe(400);
    expect(response.data.error).toBeDefined();
  });

  test("should return 400 for invalid requests", async () => {
    const sample = { invalid: "any invalid input" };
    const response = await axios.post("/", sample);
    expect(response.status).toBe(400);
    expect(response.data.error).toBeDefined();
  });
});

describe("GET /:id", () => {
  test("should return 200 for existent id", async () => {
    const packageCall = await axios.post("/", packageSamples.dummy);
    const packageId = packageCall.data.package_id;

    const response = await axios.get(`/${packageId}`);
    const fetchedPackage = response.data;
    expect(fetchedPackage.name).toBe(packageSamples.dummy.name);
    expect(fetchedPackage.description).toBe(packageSamples.dummy.description);
  });

  test("should return 404 for inexistent uuid", async () => {
    const randomId = uuid();
    const response = await axios.get(`/${randomId}`);
    expect(response.status).toBe(404);
  });

  test("should return 400 for invalid uuid type", async () => {
    const errorId = "not_a_uuid";
    const response = await axios.get(`/${errorId}`);
    expect(response.status).toBe(400);
  });
});

describe("DELETE /:id", () => {
  test("should return 204 when succeeding", async () => {
    const packageCall = await axios.post("/", packageSamples.dummy);
    const packageId = packageCall.data.package_id;
    const response = await axios.delete(`/${packageId}`);
    expect(response.status).toBe(204);
  });

  test("should return 404 for inexistent package", async () => {
    const randomId = uuid();
    const response = await axios.delete(`/${randomId}`);
    expect(response.status).toBe(404);
  });

  test("should return 400 for invalid uuid", async () => {
    const errorId = "not_a_uuid";
    const response = await axios.get(`/${errorId}`);
    expect(response.status).toBe(400);
  });
});
