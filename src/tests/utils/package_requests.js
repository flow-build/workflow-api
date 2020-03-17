const request = require('supertest');

const package_dtos = {
  package_test_1: {
    name: "package_test_1",
    description: "test package 1",
    code:
      ["do",
        ["def", "package_test_1",
          ["fn", [],
            ["prn", ["`", "Dummy test is running!"]]]]]
  }
};

const packageRequests = (server, auth_header) => {
  return {
    savePackage: async (body) => {
      return await request(server)
        .post(`/packages`)
        .send(body)
        .set(...auth_header);
    },
    fetchPackage: async (package_id) => {
      return await request(server)
        .get(`/packages/${package_id}`)
        .set(...auth_header);
    },
    deletePackage: async (package_id) => {
      return await request(server)
        .delete(`/packages/${package_id}`)
        .set(...auth_header);
    }
  };
};

module.exports = {
  package_dtos,
  packageRequests
};
