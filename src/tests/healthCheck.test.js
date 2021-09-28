require("dotenv").config();
const axios = require("axios");
const { startServer } = require("../app");
const { delay } = require("./utils/auxiliar");
const { config } = require("./utils/requestConfig");

let server;

beforeAll(() => {
  server = startServer(3001);
  axios.defaults.baseURL = `${config.baseURL}/`;
  axios.defaults.headers = config.headers;
  axios.defaults.validateStatus = config.validateStatus;
});

beforeEach(async () => {
  await delay(100);
});

afterAll(async () => {
  await server.close();
});

describe("GET /", () => {
  test("should return 200", async () => {
    const response = await axios.get("/");

    expect(response.status).toBe(200);
  });
});

describe("GET /healthcheck", () => {
  test("should return 200", async () => {
    const response = await axios.get("/");

    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.version).toBeDefined();
    expect(response.data.message).toBeDefined();
  });
});
