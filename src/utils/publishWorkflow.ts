import { publishMessage } from "../services/broker"
import { identifyTarget } from "../utils/identifyTarget"

import { envs } from "src/config/env"
import { Workflow } from "src/types/flowbuild"

const namespace = envs.FLOWBUILD.EVENTS.NAMESPACE

export async function publishWorkflow(workflow: Workflow) {
  const [hasTarget, event] = identifyTarget(workflow.blueprint)
  let topic = (namespace)
    ? `${namespace}.wem.workflow.target.create`
    : `wem.workflow.target.create`
  if (envs.FLOWBUILD.EVENTS.BROKER === "MQTT") {
    topic = (namespace)
      ? `/${namespace}/workflow/${workflow.id}/create`
      : `/workflow/${workflow.id}/create`
  }
  publishMessage({
    context: {
      topic,
      message: {
        name: workflow.name,
        workflow_id: workflow.id,
        hash: workflow.hash,
        hasTarget: hasTarget,
        event: event,
        version: workflow.version
      }
    }
  }, envs.FLOWBUILD.EVENTS.BROKER)
}
