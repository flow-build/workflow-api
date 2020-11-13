const { startServer } = require("../app");
const request = require("supertest");

let server;

beforeAll(() => {
  server = startServer(3001);
});

afterAll(() => {
  server.close();
});

describe("token endpoint", () => {
  let cachedEnvJwtSecret;
  beforeAll(() => {
    cachedEnvJwtSecret = process.env.JWT_TOKEN;
    process.env.JWT_TOKEN = null;
  });

  afterAll(() => {
    process.env.JWT_TOKEN = cachedEnvJwtSecret;
  });

  test("should return 200 with correct secret", async () => {
    const res = await request(server)
          .post("/token");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("jwtToken");
    expect(res.body.payload).toHaveProperty("actor_id");
    expect(res.body.payload).toHaveProperty("claim");

    // Taken from uuid package code
    const uuidRegex = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
    expect(res.body.payload.actor_id).toMatch(uuidRegex);
    expect(Array.isArray(res.body.payload.claim)).toBe(true);
  });

  test("should return different tokens for different secrets", async () => {
    const res1 = await request(server)
          .post("/token")
          .set({ "x-secret": "1234" });

    expect(res1.statusCode).toBe(200);
    token1 = res1.body.jwtToken;

    const res2 = await request(server)
          .post("/token")
          .set({ "x-secret": "4321" });

    expect(res2.statusCode).toBe(200);
    token2 = res2.body.jwtToken;

    expect(res1).not.toEqual(res2);
  });

  test("sent actor_id and claim should also be returned in payload", async () => {
    const actor_id = "5dd67d62-8f23-46b1-9a74-96292ed00656";
    const claims = ["user", "admin"];
    const res = await request(server)
          .post("/token")
          .send({
            actor_id,
            claims
          });

    expect(res.statusCode).toBe(200);
    expect(res.body.payload.actor_id).toBe(actor_id);
    expect(res.body.payload.claims).toEqual(claims);
  })
});
