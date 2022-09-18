require("dotenv").config();
const axios = require("axios");
const actualTimeout = setTimeout;
const { logger } = require("../../utils/logger");

function wait(ms = 2000) {
  return new Promise((resolve) => {
    actualTimeout(resolve, ms);
  });
}
class World {

  constructor(obj) {
    this.baseURL = obj.baseURL;
    this.headers = obj.headers;
  }

  async waitProcessStop(pid, timeout = 1000) {
    logger.info(`waitProcessStop ${pid}`);
    const expectedStatus = ["waiting", "error", "finished"];
    do {
      if (timeout === 1000) {
        await wait(timeout);
        await this.getCurrentState(pid);
      } else {
        await this.getCurrentState(pid);
        await wait(timeout*1200);
      }
      logger.debug(`process status: ${this.currentStatus}`);
    } while (!expectedStatus.includes(this.currentStatus));
    return true;
  }

  async getCurrentState(pid) {
    logger.info(`getCurrentState ${pid}`);
    const response = await axios({
      method: "get",
      url: `/processes/${pid}/state`,
      baseURL: this.baseURL,
      headers: this.headers,
    });
    logger.debug("getCurrentState response");
    this.currentState = response.data;
    this.currentStatus = response.data.state.status;
    this.nodeId = response.data.state.node_id;
    return true;
  }
}

module.exports = { World }