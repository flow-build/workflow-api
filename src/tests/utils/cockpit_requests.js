const supertest = require("supertest");
const samples = require("./samples");

let server;
function setAuthorization(request, token = `Bearer ${samples.valid_token}`) {
  return request.set("Authorization", token);
}
module.exports = {
  setServer: (value) => (server = value),
  fetchWorkflowsWithProcessStatusCount: (filter) => {
    const request = supertest(server).get("/cockpit/workflows/stats").query(filter);
    return setAuthorization(request);
  },
  setProcessState: (process_id, state_data) => {
    const request = supertest(server).post(`/cockpit/processes/${process_id}/state`).send(state_data);
    return setAuthorization(request);
  },
  runPendingProcess: (process_id, actor_data) => {
    const request = supertest(server).post(`/cockpit/processes/${process_id}/state/run`).send(actor_data);
    return setAuthorization(request);
  },
  getProcessesByWorkflowId: (workflow_id) => {
    const request = supertest(server).get(`/cockpit/workflows/${workflow_id}/processes`);
    return setAuthorization(request);
  },
  getProcessesByWorkflowName: (workflow_name) => {
    const request = supertest(server).get(`/cockpit/workflows/name/${workflow_name}/processes`);
    return setAuthorization(request);
  },
  validateBlueprint: (blueprint_spec) => {
    const request = supertest(server).post("/cockpit/workflows/validate").send(blueprint_spec);
    return setAuthorization(request);
  },
  compareBlueprint: (blueprint_spec) => {
    const request = supertest(server).post("/cockpit/workflows/compare").send(blueprint_spec);
    return setAuthorization(request);
  },
  getProcessStateByNodeId: (process_id, node_id) => {
    const request = supertest(server).get(`/cockpit/processes/${process_id}/state/${node_id}`);
    return setAuthorization(request);
  },
  transferProcessState: (process_id, state_id) => {
    const request = supertest(server).post(`/cockpit/processes/${process_id}/set/${state_id}`);
    return setAuthorization(request);
  },
  getProcessState: (state_id) => {
    const request = supertest(server).get(`/cockpit/processes/state/${state_id}`);
    return setAuthorization(request);
  },
  getStatesFromNode: (workflow_name, node_id) => {
    const request = supertest(server).get(`/cockpit/workflows/name/${workflow_name}/states/${node_id}`);
    return setAuthorization(request);
  },
  getProcessExecution: (process_id) => {
    const request = supertest(server).get(`/cockpit/processes/${process_id}/execution`);
    return setAuthorization(request);
  },
};
