require("dotenv").config();
const axios = require("axios");
const { db } = require("./utils/db");
const { startServer } = require("../app");
const { cleanDb } = require("./utils/auxiliar");
const { config } = require("./utils/requestConfig");
const { tearDownEnvironment, createTestCockpit } = require("./utils/fixtures");
const { setDbConnection } = require("../services/cockpit");

let server;
const prefix = "/cockpit";

beforeAll(async () => {
  createTestCockpit(db);

  server = startServer(3001);
  axios.defaults.baseURL = `${config.baseURL}`;
  axios.defaults.headers = config.headers;
  axios.defaults.validateStatus = config.validateStatus;
  setDbConnection(db);

  await cleanDb();
});

afterAll(async () => tearDownEnvironment(server, db));

describe("POST /cockpit/envs", () => {
  const route = `${prefix}/envs`;

  test("Should return 201 for env created", async () => {
    const response = await axios.post(route, {
      key: "API_HOST",
      value: "localhost"
    });
    expect(response.status).toEqual(201);
    expect(response.data.key).toBe("API_HOST");
    expect(response.data.value).toBe("localhost");
    expect(response.data.type).toBe("string");
  });

  test("Should return 400 for an invalid request body", async () => {
    const response = await axios.post(route, {
      value: "localhost"
    });
    expect(response.status).toEqual(400);
    expect(response.data.message).toBe("Invalid Request Body");
    expect(response.data.error[0].message).toBe("must have required property 'key'");
  });

  test("Should return 200 for env updated", async () => {
    const response = await axios.post(route, {
      key: "API_HOST",
      value: "0.0.0.0"
    });
    expect(response.status).toEqual(200);
    expect(response.data.key).toBe("API_HOST");
    expect(response.data.value).toBe("0.0.0.0");
  });
});

describe("GET /cockpit/envs", () => {
  const route = `${prefix}/envs`;

  test("Should return 200 with envs", async () => {
    const response = await axios.get(route);
    expect(response.status).toEqual(200);
    expect(response.data).toHaveLength(1);
    expect(response.data[0].key).toBe("API_HOST");
    expect(response.data[0].value).toBe("0.0.0.0");
    expect(response.data[0].origin).toBe("table");
  });
});

describe("GET /cockpit/envs/:key", () => {
  test("Should return 200 with env API_HOST", async () => {
    const response = await axios.get(`${prefix}/envs/API_HOST`);
    expect(response.status).toEqual(200);
    expect(response.data.key).toBe("API_HOST");
    expect(response.data.value).toBe("0.0.0.0");
    expect(response.data.type).toBe("string");
  });

  test("Should return 200 with env from environment (when does not exist on table)", async () => {
    const response = await axios.get(`${prefix}/envs/MQTT`);
    expect(response.status).toEqual(200);
    expect(response.data.key).toBe("MQTT");
    expect(response.data.value).toBe("true");
    expect(response.data.type).toBe("string");
  });

  test("Should return 404 for no env found", async () => {
    const response = await axios.get(`${prefix}/envs/LIMIT`);
    expect(response.status).toEqual(404);
    expect(response.data.message).toBe("Environment variable not found");
  });
});

describe("DELETE /cockpit/envs/:key", () => {
  test("Should return 204 for env API_HOST deleted", async () => {
    const response = await axios.delete(`${prefix}/envs/API_HOST`);
    expect(response.status).toEqual(204);
  });

  test("Should return 404 for no env found", async () => {
    const response = await axios.delete(`${prefix}/envs/LIMIT`);
    expect(response.status).toEqual(404);
    expect(response.data.message).toBe("Environment variable not found");
  });
});