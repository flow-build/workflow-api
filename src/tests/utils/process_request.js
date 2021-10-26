const request = require("supertest");

const process_dtos = {
  continue: {
    input: {
      custom_data: "goes_here",
    },
  },
  set_state: {
    process_state: {
      step_number: 99,
      node_id: "99",
      next_node_id: "100",
      bag: { set_state_bag: "goes_here" },
      external_input: { set_state_external_input: "goes_here" },
      result: { set_state_result: "goes_here" },
      error: "set state error goes here",
      status: "set state status goes here",
    },
  },
};

const processRequests = (server, auth_header) => {
  return {
    fetch: async (process_id) => {
      return await request(server)
        .get(`/processes/${process_id}`)
        .set(...auth_header);
    },
    fetchList: async (filters = {}) => {
      return await request(server)
        .get("/processes")
        .query(filters)
        .set(...auth_header);
    },
    fetchStateHistory: async (process_id) => {
      return await request(server)
        .get(`/processes/${process_id}/history`)
        .set(...auth_header);
    },
    fetchState: async (process_id) => {
      return await request(server)
        .get(`/processes/${process_id}`)
        .set(...auth_header);
    },
    runProcess: async (process_id, body) => {
      return await request(server)
        .post(`/processes/${process_id}/run`)
        .send(body)
        .set(...auth_header);
    },
    abort: async (process_id) => {
      return await request(server)
        .post(`/processes/${process_id}/abort`)
        .set(...auth_header);
    },
  };
};

module.exports = {
  process_dtos,
  processRequests,
};
