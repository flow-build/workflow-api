"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJWTToken = createJWTToken;
const jsrsasign_1 = __importDefault(require("jsrsasign"));
function createJWTToken(input) {
    const jwtHeader = { alg: "HS256", typ: "JWT" };
    const tNow = jsrsasign_1.default.KJUR.jws.IntDate.get("now");
    const tEnd = tNow + input.duration;
    input.payload.iat = tNow;
    input.payload.exp = tEnd;
    return jsrsasign_1.default.KJUR.jws.JWS.sign("HS256", jwtHeader, input.payload, { utf8: input.secret });
}
