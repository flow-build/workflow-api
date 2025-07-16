import "express"

declare module "express" {
  interface Request {
    state?: Record<string, any>
    actorData?: {
      userAgent?: {
        os: string
        version: string
        family: string
        device: string
      }
      actorId?: string
      claims?: string[]
      sessionId?: string
      ip?: string
      trace?: {
        tracestate?: string | string[]
        traceparent?: string | string[]
      }
      extData?: Record<string, any>
    }
  }
}
