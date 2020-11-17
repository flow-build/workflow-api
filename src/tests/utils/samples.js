const { createJWTToken } = require("../../utils/token_generator");
const { jwtSecret } = require("../../utils/jwt_secret");

samples = {};

samples.actor_data = {
  actor_id: 1,
  claims: []
}

samples.valid_token = createJWTToken(samples.actor_data, jwtSecret, 3600);


module.exports = samples;
