const tokenSamples = require("../../samples/token");

const config = {
  baseURL: "http://127.0.0.1:3001",
  headers: {
    common: {
      Authorization: `Bearer ${tokenSamples.validToken}`,
    },
    post: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  },
  validateStatus: function (status) {
    return status <= 500;
  },
};

module.exports = {
  config,
};
