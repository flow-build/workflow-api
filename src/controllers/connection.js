const { publishMessage } = require("../services/broker")
const { utils: { ENGINE_ID } } = require("@flowbuild/engine");

const brokerMapping = {
  MQTT: "MQTT",
  AMQP: "AMQP",
  KAFKA: "KAFKA"
};

const sendBeacon = async (ctx, next) => {
  console.log('sendBeacon called')
  const actorId = ctx.state?.actor_data?.actor_id || '';

  const token = ctx.request?.body?.token || "";
  const brokerQS = ctx.request?.query?.broker;
  const broker = brokerMapping[brokerQS] || "MQTT";
  const isEnabled = process.env[broker]

  if (actorId && isEnabled === 'true') {
    const payload = {
      timestamp: Date.now(),
      engine_id: ENGINE_ID,
      mqtt_host: process.env.MQTT_HOST,
      flowbuild_host: process.env.FLOWBUILD_URL,
      token
    };

    switch (broker) {
      case brokerMapping.MQTT:
        const mqtt_namespace = process.env.MQTT_NAMESPACE;
        const topic = mqtt_namespace
          ? `/${mqtt_namespace}/beacon/${actorId}`
          : `/beacon/${actorId}`
        await publishMessage({ topic, message: payload }, broker);
        break;
      case brokerMapping.KAFKA:
        await publishMessage({ context: { topic: `beacon.${actorId}`, message: payload } }, broker);
        break;
      case brokerMapping.AMQP:
        await publishMessage({ context: { message: payload } }, broker);
        break;
      default:
        break;
    }

    ctx.status = 202;
    return
  }
  ctx.status = 400;
  ctx.body = {
    message: `valid actor_id: ${!!actorId} | ${broker} is enabled: ${isEnabled}`
  }
  return
}

module.exports = {
  sendBeacon
}