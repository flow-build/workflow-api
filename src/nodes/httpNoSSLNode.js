require("dotenv").config();
const { Nodes, ProcessStatus } = require("@flowbuild/engine");
const axios = require("axios").default;
const https = require("https");

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})
axios.defaults.httpsAgent = httpsAgent

class HttpNoSSLNode extends Nodes.HttpSystemTaskNode {

  async _run(executionData) {
    const { verb, url, headers } = this.request;
    const result = await axios({
      method: verb,
      url: url,
      headers: headers,
    });
    return [{ status: result.status, data: result.data }, ProcessStatus.RUNNING];
  }
}

module.exports = {
  HttpNoSSLNode,
};
