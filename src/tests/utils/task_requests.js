const request = require('supertest');

const taskRequests = (server, auth_header) => {
  return {
    getAvailableForActor: async (filters = {}) => {
      return await request(server)
        .get("/processes/available")
        .query(filters)
        .set(...auth_header);
    },
    getDoneForActor: async (filters = {}) => {
      return await request(server)
        .get("/processes/done")
        .query(filters)
        .set(...auth_header);
    },
    getActivityById: async (activity_manager_id) => {
      return await request(server)
        .get(`/processes/activityManager/${activity_manager_id}`)
        .set(...auth_header);
    },
    getActivityForActor: async (process_id) => {
      return await request(server)
        .get(`/processes/${process_id}/activity`)
        .set(...auth_header);
    },
    commitActivity: async (process_id, external_input) => {
      return await request(server)
        .post(`/processes/${process_id}/commit`)
        .send(external_input)
        .set(...auth_header);
    },
    pushActivity: async (process_id) => {
      return await request(server)
        .post(`/processes/${process_id}/push`)
        .send({})
        .set(...auth_header);
    },
    submitActivity: async (activity_manager_id, external_input) => {
      return await request(server)
        .post(`/activity_manager/${activity_manager_id}/submit`)
        .send(external_input)
        .set(...auth_header);
    },
    commitActivityByActivityManager: async (activity_manager_id, external_input) => {
      return await request(server)
        .post(`/activity_manager/${activity_manager_id}/commit`)
        .send(external_input)
        .set(...auth_header);
    }
  };
};

module.exports = {
  taskRequests
};
