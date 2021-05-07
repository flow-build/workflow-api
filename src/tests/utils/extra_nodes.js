const { Nodes } = require("@fieldlink/workflow-engine");

const SystemTaskNode = Nodes.SystemTaskNode;

class CustomTaskNode extends SystemTaskNode{
  async _run(execution_data, lisp) {
    return[{custom_data: "data"}, 'running'];
  }
}

module.exports = {
  CustomTask: CustomTaskNode
};
