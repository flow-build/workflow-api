const { publishMessage } = require("../services/broker")
const { utils: { ENGINE_ID } } = require("@flowbuild/engine");

const sendBeacon = async (ctx, next) => {
  console.log('sendBeacon called')
  const actorId = ctx.state?.actor_data?.actor_id || '';

  const token = ctx.request?.body?.token || "";

  if (actorId) {
    const payload = {
      timestamp: Date.now(),
      engine_id: ENGINE_ID,
      mqtt_host: process.env.MQTT_HOST,
      flowbuild_host: process.env.FLOWBUILD_URL,
      token
    };

    const emittedTo = []
    if (process.env.MQTT) {
      const mqtt_namespace = process.env.MQTT_NAMESPACE;
      const topic = mqtt_namespace
        ? `/${mqtt_namespace}/beacon/${actorId}`
        : `/beacon/${actorId}`
      await publishMessage({ topic, message: payload }, "MQTT");
      emittedTo.push("MQTT");
    }

    if (process.env.KAFKA) {
      await publishMessage({ context: { topic: `beacon.${actorId}`, message: payload } }, "KAFKA");
      emittedTo.push("KAFKA");
    }

    if (process.env.AMQP) {
      await publishMessage({ context: { message: payload } }, "AMQP");
      emittedTo.push("AMQP");
    }

    if (!emittedTo.length) {
      ctx.status = 500;
      ctx.body = {
        message: `No broker is enable on Flowbuild Server`
      }
      return
    }
    ctx.status = 200;
    ctx.body = {
      message: `emitted message to ${emittedTo}`
    }
    return
  }
  ctx.status = 400;
  ctx.body = {
    message: `invalid actor_id`
  }
  return
}

module.exports = {
  sendBeacon
}