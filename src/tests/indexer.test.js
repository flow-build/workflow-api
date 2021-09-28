require("dotenv").config();
const axios = require("axios");
const { v1: uuid } = require("uuid");
const { db } = require("./utils/db");
const { startServer } = require("../app");
const { delay, cleanDb } = require("./utils/auxiliar");
const { config } = require("./utils/requestConfig");

let server;

beforeAll(() => {
  server = startServer(3001);
  axios.defaults.baseURL = `${config.baseURL}/index`;
  axios.defaults.headers = config.headers;
  axios.defaults.validateStatus = config.validateStatus;
});

beforeEach(async () => {
  await cleanDb();
  await delay(500);
});

afterAll(async () => {
  await cleanDb();
  await db.destroy();
  server.close();
});

describe("POST /index", () => {
  test("should return 200 for valid input", async () => {
    let sample = {
      entity_type: "sample",
      entity_id: uuid(),
      process_id: uuid(),
    };
    const response = await axios.post("/", sample);

    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.id).toBeDefined();
  });

  test("should return 200 even if entity_id is not a uuid", async () => {
    let sample = {
      entity_type: "sample",
      entity_id: "not_a_uuid",
      process_id: uuid(),
    };
    const response = await axios.post("/", sample);

    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.id).toBeDefined();
  });

  test("should return 400 if entity_id is not provided", async () => {
    let sample = {
      entity_type: "sample",
      process_id: "not_a_uuid",
    };

    const firstCall = await axios.post("/", sample);
    expect(firstCall.status).toBe(400);
    expect(firstCall.data).toBeDefined();
    expect(firstCall.data.error.errorType).toBe("validation");
  });

  test("should return 400 if process_id is not a uuid", async () => {
    let sample = {
      entity_type: "sample",
      entity_id: uuid(),
      process_id: "not_a_uuid",
    };

    const firstCall = await axios.post("/", sample);
    expect(firstCall.status).toBe(400);
    expect(firstCall.data).toBeDefined();
    expect(firstCall.data.error.errorType).toBe("validation");
  });

  test("should return 400 for repeated input", async () => {
    let sample = {
      entity_type: "sample",
      entity_id: uuid(),
      process_id: uuid(),
    };

    const firstCall = await axios.post("/", sample);
    expect(firstCall.status).toBe(200);

    const secondCall = await axios.post("/", sample);
    expect(secondCall.status).toBe(400);
    expect(secondCall.data.error.errorType).toBe("save");
  });
});

describe("GET /entity/:id", () => {
  const entityId = uuid();
  const processId = uuid();
  let indexId;

  beforeEach(async () => {
    let sample = {
      entity_type: "sample",
      entity_id: entityId,
      process_id: processId,
    };
    const response = await axios.post("/", sample);
    indexId = response.data.id;
  });

  test("should return 200", async () => {
    const response = await axios.get(`/entity/${entityId}`);
    expect(response.status).toBe(200);
    expect(response.data[0].id).toBe(indexId);
    expect(response.data[0].entity_type).toBe("sample");
    expect(response.data[0].process_id).toBe(processId);
  });
});

describe("GET /entity/type/:type", () => {
  const entity_id = uuid();
  const entity_type = "sample";

  beforeEach(async () => {
    await axios.post("/", { entity_type, entity_id, process_id: uuid() });
    await axios.post("/", { entity_type, entity_id, process_id: uuid() });
    await axios.post("/", { entity_type, entity_id: uuid(), process_id: uuid() });
  });

  test("should return 200", async () => {
    const response = await axios.get(`/entity/type/${entity_type}`);
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data).toHaveLength(2);
  });

  test("should return count = 2 to entity_id", async () => {
    const response = await axios.get(`/entity/type/${entity_type}`);
    expect(response.status).toBe(200);
    const data = response.data.find((item) => item.entity_id === entity_id);
    expect(data.count).toBe("2");
  });

  test("should return 200 for an non-existant type", async () => {
    const sampleType = "whatever";
    const response = await axios.get(`/entity/type/${sampleType}`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveLength(0);
  });
});

describe("GET /process/:id", () => {
  const entityId = uuid();
  const processId = uuid();
  let indexId;

  beforeEach(async () => {
    let sample = {
      entity_type: "sample",
      entity_id: entityId,
      process_id: processId,
    };
    const response = await axios.post("/", sample);
    indexId = response.data.id;
  });

  test("should return 200", async () => {
    const response = await axios.get(`/process/${processId}`);
    expect(response.status).toBe(200);
    expect(response.data[0].id).toBe(indexId);
    expect(response.data[0].entity_type).toBe("sample");
    expect(response.data[0].entity_id).toBe(entityId);
  });

  test("should return 200 for a non existing process", async () => {
    const randomId = uuid();
    const response = await axios.get(`/process/${randomId}`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveLength(0);
  });
});

describe("DELETE /process/:id", () => {
  const process_id = uuid();

  beforeEach(async () => {
    await axios.post("/", { entity_type: "sample", entity_id: uuid(), process_id });
    await axios.post("/", { entity_type: "sample", entity_id: uuid(), process_id });
  });

  test("should return 200 for existing process_id", async () => {
    const response = await axios.delete(`/process/${process_id}`, {});
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data).toHaveLength(2);
  });

  test("should return an empty array for a non-existing process_id", async () => {
    const randomId = uuid();
    const response = await axios.delete(`/process/${randomId}`, {});
    expect(response.status).toBe(200);
    expect(response.data).toHaveLength(0);
  });
});

describe("DELETE /entity/:id", () => {
  const entity_id = uuid();

  beforeEach(async () => {
    await axios.post("/", { entity_type: "sample", entity_id, process_id: uuid() });
    await axios.post("/", { entity_type: "sample", entity_id, process_id: uuid() });
  });

  test("should return 200 for existing entity_id", async () => {
    const response = await axios.delete(`/entity/${entity_id}`, {});
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data).toHaveLength(2);
  });

  test("should return an empty array for a non-existing entity_id", async () => {
    const randomId = uuid();
    const response = await axios.delete(`/entity/${randomId}`, {});
    expect(response.status).toBe(200);
    expect(response.data).toHaveLength(0);
  });
});

describe("DELETE /:id", () => {
  let indexId;

  beforeEach(async () => {
    const response = await axios.post("/", { entity_type: "sample", entity_id: uuid(), process_id: uuid() });
    indexId = response.data.id;
  });

  test("should return 200 for existing process_id", async () => {
    const response = await axios.delete(`/${indexId}`, {});
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data).toBe(1);
  });

  test("should return 0 for a non-existing index_id", async () => {
    const randomId = uuid();
    const response = await axios.delete(`/${randomId}`);
    expect(response.status).toBe(200);
    expect(Object.keys(response.data)).toHaveLength(0);
  });
});
