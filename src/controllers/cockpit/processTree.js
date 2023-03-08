const { logger } = require("../../utils/logger");
const { Tree } = require("@flowbuild/process-tree");
const { getCockpit } = require("../../engine");
const { db } = require('../../utils/db')
const tree = new Tree(db);

const getProcessTree = async (ctx, next) => {
  logger.verbose("called getProcessTree");

  const process_id = ctx.params.id;
  const myTree = await tree.getPath(process_id);

  const cockpit = getCockpit();
  const promises = myTree.map(async p => {
    const process = await cockpit.fetchProcess(p.processId);
    return {
      process_id: p.processId,
      parent_id: p.parentId,
      depth: p.depth,
      workflow_name: process.workflow_name,
      current_status: process._current_status
    }
  })

  const processes = await Promise.all(promises)

  if (myTree) {
    ctx.status = 200;
    ctx.body = processes;
  } else {
    ctx.status = 404;
    ctx.body = { message: "Not found" };
  }
  
  return next();
}

module.exports = {
  getProcessTree
}