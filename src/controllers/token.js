const uuid = require("uuid/v1");
const rs = require("jsrsasign");

const jwtSecret = process.env.JWT_TOKEN || "1234";

const getToken = (ctx, next) => {
  let secret;
  try {
    secret = ctx.get('x-secret');
  }
  catch (err) {
    secret = jwtSecret;
  }

  const body = ctx.request.body;
  if (!body.actor_id) {
    body.actor_id = uuid();
  }
  if (!body.claims) {
    body.claims = [];
  }

  const jwtToken = createJWTToken(body, secret);
  ctx.status = 200;
  ctx.body = {
    jwtToken,
    payload: body
  };
}

const createJWTToken = (payload, secret) => {
  const jwtHeader = { alg: "HS256", typ: "JWT" };
  return rs.KJUR.jws.JWS.sign("HS256", jwtHeader, payload, { utf8: secret })
}

module.exports = {
  getToken
};
