const supertest = require("supertest");
const samples = require("./samples");

let server;
function setAuthorization(request, token = `Bearer ${samples.valid_token}`) {
    return request.set('Authorization', token)
}
module.exports = {
    setServer: (value) => server = value,
    fetchWorkflowsWithProcessStatusCount: (filter) => {
        const request = supertest(server)
            .get("/cockpit/workflows/stats")
            .query(filter);
        return setAuthorization(request);
    },
    setProcessState: (process_id, state_data) => {
        const request = supertest(server)
            .post(`/cockpit/processes/${process_id}/state`)
            .send(state_data);
        return setAuthorization(request);
    },
    runPendingProcess: (process_id, actor_data) => {
        const request = supertest(server)
            .post(`/cockpit/processes/${process_id}/state/run`)
            .send(actor_data);
        return setAuthorization(request);
    },
}
