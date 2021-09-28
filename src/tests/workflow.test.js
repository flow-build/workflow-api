require("dotenv").config();
const axios = require("axios");
const { v1: uuid } = require("uuid");
const { setEngine, setCockpit } = require("../engine");
const { Engine, Cockpit } = require("@flowbuild/engine");
const { db } = require("./utils/db");
const { startServer } = require("../app");
const workflowSamples = require("../samples/workflows");
const { delay, cleanDb } = require("./utils/auxiliar");
const { config } = require("./utils/requestConfig");
const engine = new Engine("knex", db);
const cockpit = new Cockpit("knex", db);
setEngine(engine);
setCockpit(cockpit);

let server;

//TODO: Validar output schema de cada chamada

beforeAll(() => {
  server = startServer(3001);
  axios.defaults.baseURL = `${config.baseURL}/workflows`;
  axios.defaults.headers = config.headers;
  axios.defaults.validateStatus = config.validateStatus;
});

beforeEach(async () => {
  await cleanDb();
  await delay(1000);
});

afterAll(async () => {
  await _clean();
  await db.destroy();
  server.close();
});

describe("POST /workflows", () => {
  test("should return 201 for valid input", async () => {
    let sample = workflowSamples.basicStartFinish;
    const response = await axios.post("/", sample);

    expect(response.status).toBe(201);
    expect(response.data).toBeDefined();

    const workflow = response.data;
    expect(workflow.workflow_id).toBeDefined();
  });

  test("should return the id provided", async () => {
    const workflowId = uuid();
    const sample = workflowSamples.basicStartFinish;
    sample.workflow_id = workflowId;

    const response = await axios.post("/", sample);
    expect(response.status).toBe(201);
    expect(response.data).toBeDefined();

    const workflow = response.data;
    expect(workflow.workflow_id).toBe(workflowId);
  });

  test("should return 400 if for a repeated id", async () => {
    const workflowId = uuid();
    const sample = workflowSamples.basicStartFinish;
    sample.workflow_id = workflowId;

    const firstCall = await axios.post("/", sample);
    expect(firstCall.status).toBe(201);
    expect(firstCall.data).toBeDefined();

    const secondCall = await axios.post("/", sample);
    expect(secondCall.status).toBe(400);
    expect(secondCall.data).toBeDefined();
    expect(secondCall.data.error).toBe("workflow already exists");
  });

  test("should return 201 for repeated input (without workflow_id)", async () => {
    let newSample = workflowSamples.singleUserTask;

    const firstCall = await axios.post("/", newSample);
    expect(firstCall.status).toBe(201);
    expect(firstCall.data.workflow_id).toBeDefined();

    const secondCall = await axios.post("/", newSample);
    expect(secondCall.status).toBe(201);
    expect(secondCall.data.workflow_id).toBeDefined();
    expect(secondCall.data.workflow_id).not.toBe(firstCall.data.workflow_id);
  });

  test("should return 400 if the spec misses a node", async () => {
    let sample = workflowSamples.invalidMissingNode;
    const response = await axios.post("/", sample);
    expect(response.status).toBe(400);
    expect(response.data).toBeDefined();
    expect(response.data.message).toBe("Invalid Connections");
  });

  test("should return 400 if the spec misses a lane", async () => {
    let sample = workflowSamples.invalidMissingLane;
    const response = await axios.post("/", sample);
    expect(response.status).toBe(400);
    expect(response.data).toBeDefined();
    expect(response.data.message).toBe("Invalid Connections");
  });

  /*   test("should return 400 if the spec has an unknown node", async () => {
    let sample = workflowSamples.invalidWrongNode;
    const response = await axios.post("/", sample);
    expect(response.status).toBe(400);
    expect(response.data).toBeDefined();
    expect(response.data.message).toBe("Invalid Node");
  }); */

  test("should return 400 if the spec has an duplicated node", async () => {
    let sample = workflowSamples.invalidDuplicatedNode;
    const response = await axios.post("/", sample);
    expect(response.status).toBe(400);
    expect(response.data).toBeDefined();
    expect(response.data.message).toBe("Invalid Connections");
  });

  test("should return 400 if the spec has an duplicated node", async () => {
    let sample = workflowSamples.invalidDuplicatedLane;
    const response = await axios.post("/", sample);
    expect(response.status).toBe(400);
    expect(response.data).toBeDefined();
    expect(response.data.message).toBe("Invalid Request Body");
    expect(response.data.error[0].field).toBe("/blueprint_spec/lanes");
  });
});

describe("GET /", () => {
  beforeEach(async () => {
    await axios.post("/", workflowSamples.basicStartFinish);
    await axios.post("/", workflowSamples.singleUserTask);
    await axios.post("/", workflowSamples.notifyUserTask);
  });

  test("should return 200", async () => {
    const response = await axios.get("/");
    expect(response.status).toBe(200);
    const workflows = response.data;
    expect(workflows).toHaveLength(3);
  });
});

describe("GET /:id", () => {
  let workflowId = uuid();

  beforeEach(async () => {
    let sample = workflowSamples.basicStartFinish;
    sample.workflow_id = workflowId;
    await axios.post("/", sample);
  });

  test("should return 200 for existing workflow", async () => {
    const response = await axios.get(`/${workflowId}`);
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    const workflow = response.data;
    expect(workflow.workflow_id).toBe(workflowId);
  });

  test("should return 204 for non existing workflow", async () => {
    const randomId = uuid();
    const response = await axios.get(`/${randomId}`);
    expect(response.status).toBe(204);
  });

  test("should return 400 for invalid workflow id", async () => {
    const invalidId = "not_a_uuid";
    const response = await axios.get(`/${invalidId}`);
    expect(response.status).toBe(400);
  });
});

describe("GET /name/:name", () => {
  let workflowId = uuid();

  beforeEach(async () => {
    let sample = workflowSamples.basicStartFinish;
    sample.workflow_id = workflowId;
    await axios.post("/", sample);
  });

  test("should return 200 for existing workflow name", async () => {
    const response = await axios.get(
      `/name/${workflowSamples.basicStartFinish.name}`
    );
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    const workflow = response.data;
    expect(workflow.workflow_id).toBe(workflowId);
  });

  test("should return 204 for non existing workflow", async () => {
    const randomName = "whatever";
    const response = await axios.get(`/name/${randomName}`);
    expect(response.status).toBe(204);
  });
});

describe("POST /:id/create", () => {
  let workflowId = uuid();

  beforeEach(async () => {
    let sample = workflowSamples.basicStartFinish;
    sample.workflow_id = workflowId;
    await axios.post("/", sample);
  });

  test("should return 201 for existing workflow", async () => {
    const response = await axios.post(`/${workflowId}/create`, {});
    expect(response.status).toBe(201);
    expect(response.data).toBeDefined();
    const process = response.data;
    expect(process.process_id).toBeDefined();
  });

  test("should return 404 for non existing workflow", async () => {
    const randomId = uuid();
    const response = await axios.post(`/${randomId}/create`, {});
    expect(response.status).toBe(404);
  });
});

describe("POST /name/:name/create", () => {
  beforeEach(async () => {
    let sample = workflowSamples.basicStartFinish;
    await axios.post("/", sample);
  });

  test("should return 201 for existing workflow", async () => {
    const response = await axios.post(
      `/name/${workflowSamples.basicStartFinish.name}/create`,
      {}
    );
    expect(response.status).toBe(201);
    expect(response.data).toBeDefined();
    const process = response.data;
    expect(process.process_id).toBeDefined();
  });

  test("should return 404 for non existing workflow", async () => {
    const randomName = "whatever";
    const response = await axios.post(`/name/${randomName}/create`, {});
    expect(response.status).toBe(404);
  });
});

describe("POST /name/:name/start", () => {
  beforeEach(async () => {
    let sample = workflowSamples.basicStartFinish;
    await axios.post("/", sample);
  });

  test("should return 201 for existing workflow", async () => {
    const response = await axios.post(
      `/name/${workflowSamples.basicStartFinish.name}/start`,
      {}
    );
    expect(response.status).toBe(201);
    expect(response.data).toBeDefined();
    const process = response.data;
    expect(process.process_id).toBeDefined();
  });

  test("should return 404 for non existing workflow", async () => {
    const randomName = "whatever";
    const response = await axios.post(`/name/${randomName}/start`, {});
    expect(response.status).toBe(404);
  });
});

describe("POST /diagram", () => {
  test("should return 200 when sending the blueprint_spec at payload", async () => {
    const sample = workflowSamples.notifyUserTask;

    const response = await axios.post("/diagram", sample);
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
  });

  test("should return 200 when sending the workflow_id at payload", async () => {
    let workflowId = uuid();

    let sample = workflowSamples.basicStartFinish;
    sample.workflow_id = workflowId;
    await axios.post("/", sample);

    const response = await axios.post("/diagram", {
      workflow_id: workflowId,
    });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
  });

  test("should return 404 for non existing workflow", async () => {
    const response = await axios.post("/diagram", {
      workflow_id: uuid(),
    });
    expect(response.status).toBe(404);
  });

  test("should return 400 for an invalid workflow_id", async () => {
    const workflowId = "not-a-uuid";

    const response = await axios.post("/diagram", {
      workflow_id: workflowId,
    });
    expect(response.status).toBe(400);
  });
});

describe("DELETE /:id", () => {
  let workflowId = uuid();

  beforeEach(async () => {
    let sample = workflowSamples.basicStartFinish;
    sample.workflow_id = workflowId;
    await axios.post("/", sample);
  });

  test("should return 204 for existing workflow", async () => {
    const response = await axios.delete(`/${workflowId}`);
    expect(response.status).toBe(204);
  });

  test("should return 404 for non existing workflow", async () => {
    const randomId = uuid();
    const response = await axios.delete(`/${randomId}`);
    expect(response.status).toBe(404);
  });

  test("should return 422 if the workflow has processes", async () => {
    await axios.post(`/${workflowId}/create`, {});
    const response = await axios.delete(`/${workflowId}`);
    expect(response.status).toBe(422);
  });
});

describe("GET /:id/processes", () => {
  let basicWorkflowId = uuid();
  let userWorkflowId = uuid();

  beforeEach(async () => {
    let basic = workflowSamples.basicStartFinish;
    basic.workflow_id = basicWorkflowId;
    await axios.post("/", basic);

    let user = workflowSamples.basicStartFinish;
    user.workflow_id = userWorkflowId;
    await axios.post("/", user);

    await axios.post(`/${basicWorkflowId}/create`, {});
    await axios.post(`/${basicWorkflowId}/create`, {});
    await axios.post(`/${userWorkflowId}/create`, {});
    await axios.post(`/${userWorkflowId}/create`, {});
  });

  test("should return 200", async () => {
    const response = await axios.get(`/${basicWorkflowId}/processes`, {});
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    const processes = response.data;
    expect(processes).toHaveLength(2);
  });
});

const _clean = async () => {
  await db("activity").del();
  await db("activity_manager").del();
  await db("process_state").del();
  await db("process").del();
  await db("workflow").del();
};
