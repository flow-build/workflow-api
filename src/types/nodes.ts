export type StartNode = {
  parameters: {
    input_schema?: Record<string, any>
    timeout?: number
    duration?: string
  }
}

export type SystemTaskNode = {
  category: string
  parameters: {
    input: Record<string, any>
  }
}

export type FinishNode = {
  next: null
}

export type FlowNode = {
  next: {
    default: string
  }
  parameters: Record<string, any>
}

export type UserTaskNode = {
  parameters: {
    action: string
    encrypted_data?: string[]
    channels?: string[]
    activity_manager?: "commit" | "notify"
    activity_schema?: {
      type: string
      properties: Record<string, any>
      required: string[]
      additionalProperties: boolean | Record<string, any>
    }
  }
}

export type SubprocessNode = {
  parameters: {
    actor_data: Record<string, any>
    workflow_name: string | Record<string, any>
    valid_response: string
    input: Record<string, any>
  }
}

export type ScriptNode = {
  parameters: {
    script: {
      function: string
      args: Record<string, any>
    }
  }
}

export type JsFunction = {
  $js: string
}

export type SetToBagNode = {
  settobag: JsFunction
}

export type HttpNode = {
  request: {
    url: string | JsFunction
    verb: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD"
    header?: Record<string, any>
    timeout?: number | JsFunction
    max_content_length?: number | JsFunction
  }
  valid_response_codes?: string[]
}

export type TimerNode = {
  timeout?: number | JsFunction
  input: Record<string, any>
}

export type StartProcessNode = {
  workflow_name: string | JsFunction
  actor_data: Record<string, any>
}

export type AbortProcessNode = {
  process_id: string
}
