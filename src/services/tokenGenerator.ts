import rs from "jsrsasign"

type JwtTokenInput = {
  payload: Record<string, any>
  secret: string
  duration: number
}

export function createJWTToken(input: JwtTokenInput): string {
  const jwtHeader = { alg: "HS256", typ: "JWT" }

  const tNow = rs.KJUR.jws.IntDate.get("now")
  const tEnd = tNow + input.duration
  input.payload.iat = tNow
  input.payload.exp = tEnd

  return rs.KJUR.jws.JWS.sign("HS256", jwtHeader, input.payload, { utf8: input.secret })
}
