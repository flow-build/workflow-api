const { publishMessage } = require("../services/broker");
const { identifyTarget } = require("../utils/identifyTarget");
const namespace = process.env.WORKFLOW_EVENTS_NAMESPACE || process.env.NODE_ENV;

const publishWorkflow = async (workflow) => {
  const [hasTarget, event] = identifyTarget(workflow.blueprint_spec)
  let topic = (namespace) ?
    `${namespace}.wem.workflow.target.create`
    : `wem.workflow.target.create`
  if (process.env.WORKFLOW_EVENTS_BROKER === 'MQTT') {
    topic = (namespace) ?
      `/${namespace}/workflow/${workflow.id}/create`
      : `/workflow/${workflow.id}/create`
  }
  publishMessage({
    context: {
      topic,
      message: {
        name: workflow.name,
        workflow_id: workflow.id,
        hash: workflow._blueprint_hash,
        hasTarget: hasTarget,
        event: event,
        version: workflow._version,
      }
    }
  }, process.env.WORKFLOW_EVENTS_BROKER)
}

module.exports = {
  publishWorkflow
}