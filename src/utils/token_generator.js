const rs = require("jsrsasign");

const createJWTToken = (payload, secret, duration) => {
  const jwtHeader = { alg: "HS256", typ: "JWT" };

  const tNow = rs.KJUR.jws.IntDate.get("now");
  const tEnd = tNow + duration;
  payload.iat = tNow;
  payload.exp = tEnd;

  return rs.KJUR.jws.JWS.sign("HS256", jwtHeader, payload, { utf8: secret })
}

module.exports = {
  createJWTToken
};