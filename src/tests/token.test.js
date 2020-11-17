const { startServer } = require("../app");
const request = require("supertest");
const rs = require("jsrsasign");

let server;

beforeAll(() => {
  server = startServer(3001);
});

afterAll(() => {
  server.close();
});

describe("token endpoint", () => {
  test("should return 200 and token should be valid", async () => {
    const secret = process.env.JWT_KEY || "1234";
    const res = await request(server)
          .post("/token");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("jwtToken");
    expect(res.body).toHaveProperty("payload");

    const { jwtToken, payload } = res.body;

    expect(payload).toHaveProperty("actor_id");
    expect(payload).toHaveProperty("claims");
    expect(payload).toHaveProperty("iat");
    expect(payload).toHaveProperty("exp");
    expect(payload.exp - payload.iat).toEqual(3600);

    // Taken from uuid package code
    const uuidRegex = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
    expect(payload.actor_id).toMatch(uuidRegex);
    expect(Array.isArray(payload.claims)).toBe(true);

    const isValid = rs.KJUR.jws.JWS.verifyJWT(jwtToken,
                                              { utf8: secret },
                                              { alg: ["HS256"] });
    expect(isValid).toBe(true);
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
  });

  test("when specified, should change token duration", async () => {
    const duration = 1000000;
    const res = await request(server)
          .post("/token")
          .set({ "x-duration": duration })

    expect(res.statusCode).toBe(200);

    const { iat, exp } = res.body.payload;

    expect(exp - iat).toEqual(duration);
  })

});

describe("token environment variable", () => {
  const OLD_ENV = process.env;
  let newServer;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    delete process.env.JWT_KEY;
  });

  afterEach(() => {
    if (newServer) {
      newServer.close();
    }
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test("without variable, default should be 1234", async () => {
    const secret = "1234";

    // has to be reimported to load environment variable
    const { startServer: newStartServer } = require("../app");
    newServer = newStartServer(3002);

    const res = await request(newServer)
          .post("/token");

    expect(res.statusCode).toBe(200);

    const { jwtToken } = res.body;
    const isValid = rs.KJUR.jws.JWS.verifyJWT(jwtToken,
                                              { utf8: secret },
                                              { alg: ["HS256"] });
    expect(isValid).toBe(true);
  });

  test("changing variable should change token", async () => {
    const originalSecret = "1234";
    const newSecret = "test4321";

    process.env.JWT_KEY = newSecret;

    const { startServer: newStartServer } = require("../app");
    newServer = newStartServer(3002);
    const res = await request(newServer)
          .post("/token");

    expect(res.statusCode).toBe(200);

    const { jwtToken } = res.body;
    const isOriginalValid = rs.KJUR.jws.JWS.verifyJWT(jwtToken,
                                                      { utf8: originalSecret },
                                                      { alg: ["HS256"] });
    expect(isOriginalValid).toBe(false);

    const isNewValid = rs.KJUR.jws.JWS.verifyJWT(jwtToken,
                                                 { utf8: newSecret },
                                                 { alg: ["HS256"] });
    expect(isNewValid).toBe(true);
  });
});
