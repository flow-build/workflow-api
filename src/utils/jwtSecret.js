const { logger } = require("./logger");
let jwtSecret = process.env.JWT_KEY || "1234";

if(process.env.JWT_ALG === "RS256") {
  logger.info('using RS256, switching secretKey to certificate')
  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";
  const t0 = pemHeader + '\n' + process.env.JWT_KEY + '\n' + pemFooter
  jwtSecret = Buffer.from(t0);
}

const jwtAlgorithms = process.env.JWT_ALG || "HS256"
const jwtPassthrough = process.env.JWT_PASSTHROUGH === 'true'

module.exports = {
  jwtSecret,
  jwtAlgorithms,
  jwtPassthrough
};