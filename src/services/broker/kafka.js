require("dotenv").config();
const Kafka = require("node-rdkafka");
const { logger } = require("../../utils/logger");

const config = {
  "bootstrap.servers": process.env.KAFKA_BOOTSTRAP_SERVER,
  "security.protocol": process.env.KAFKA_SEC_PROTOCOL,
  "sasl.mechanisms": process.env.KAFKA_SASL_MECHANISMS,
  "sasl.username": process.env.KAFKA_CLUSTER_API_KEY,
  "sasl.password": process.env.KAFKA_API_SECRET,
  //"session.timeout.ms": process.env.KAFKA_SESSION_TIMEOUT,
};

class KafkaProducer {
  constructor(conf, topicConf){
    this.dying = false
    this.dead = false
    this.client = new Kafka.Producer(conf, topicConf)
  }

  disconnect() {
    return new Promise((resolve, reject) => {
      return this.client.disconnect((err, data) => {
        if (err) {
          reject(err)
        }
        logger.info('kafka producer disconnect')
        resolve(data)
      })
    })
  }

  async die() {
    this.dying = true
    await this.disconnect()
    this.dead = true
    logger.info('kafka producer graceful died')
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.client.connect({}, (err, data) => {
        if (err) {
          reject(err)
        }
        resolve(data)
      })
    })
  }

  async produce(topic, partition, message, key, timestamp) {
    return new Promise((resolve, reject) => {
      if (this.dying || this.dead) {
        reject(new ConnectionDeadError('Connection has been dead or is dying'))
      }
      try {
        this.client.produce(
          topic,
          partition,
          Buffer.from(message),
          key,
          timestamp || Date.now(),
        )
        resolve()
      } catch (err) {
        reject(err)
      }
    })

  }
}

let client;
async function connect() {
  try {
    logger.info("trying to connect to Kafka");
    client = new KafkaProducer(config);
    await client.connect();
  } catch(error) {
    logger.error(error)
  }
}

async function publishMessage({topic, message, key}) {
  logger.info(`[kafka] publishing message to topic ${topic}`);
  if(!client) {
    logger.info('[kafka] No client');
    return undefined
  }
  const messageBuf = Buffer.from(JSON.stringify(message));
  const result = await client.produce(topic, -1, messageBuf, key, Date.now())
  return result;
}   

function getClient() {
  return client
}

async function disconnect() {
  if(client._isConnected) {
    await client.die()
  } 
}

module.exports = {
  getClient,
  publishMessage: publishMessage,
  connect: connect,
  disconnect
};
  