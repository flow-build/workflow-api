require("dotenv").config();
const { v1: uuid } = require("uuid");
const axios = require("axios");
const { startServer } = require("../app");
const { delay } = require("./utils/auxiliar");
const { config } = require("./utils/requestConfig");

let server;

beforeAll(() => {
  server = startServer(3001);
  axios.defaults.baseURL = `${config.baseURL}/token`;
  axios.defaults.headers = config.headers;
  axios.defaults.validateStatus = config.validateStatus;
});

beforeEach(async () => {
  await delay(100);
});

afterAll(async () => {
  await server.close();
});

describe("POST /", () => {
  test("should return 200 without payload", async () => {
    const response = await axios.post("/");

    expect(response.status).toBe(200);
    expect(response.data.jwtToken).toBeDefined();
    expect(response.data.payload.actor_id).toBeDefined();

    const duration = response.data.payload.exp - response.data.payload.iat;
    expect(duration).toBe(3600);
  });

  test("should use provided duration", async () => {
    const definedDuration = 6000;

    const response = await axios.post("/", {}, { headers: { "x-duration": definedDuration } });

    expect(response.status).toBe(200);
    expect(response.data.jwtToken).toBeDefined();
    expect(response.data.payload.actor_id).toBeDefined();

    const duration = response.data.payload.exp - response.data.payload.iat;
    expect(duration).toBe(definedDuration);
  });

  test("should use provided actor_id", async () => {
    const actorId = uuid();
    const response = await axios.post("/", { actor_id: actorId });

    expect(response.status).toBe(200);
    expect(response.data.jwtToken).toBeDefined();
    expect(response.data.payload.actor_id).toBe(actorId);
  });

  test("should use provided claims", async () => {
    const claims = ["a", "b"];
    const response = await axios.post("/", { claims });

    expect(response.status).toBe(200);
    expect(response.data.jwtToken).toBeDefined();
    expect(response.data.payload.claims).toStrictEqual(claims);
  });
});
