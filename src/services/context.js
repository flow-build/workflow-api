let db;

function setDbConnection(dbConnection) {
  db = dbConnection;
}

const table = "node_context"

async function fetchAll() {
  let result;

  result = await db(table);

  return result;
}

async function fetch(id) {
  let result;

  result = await db(table).where("id", id).first();

  return result;
}

async function fetchByWorkflow(name, nodeId) {
  let result;

  result = await db(table).where({ 
    "workflow_name": name,
    "node_id": nodeId
  });

  return result;
}

async function save(obj) {
  const isUpdate = obj.id && (await fetch(obj.id));
  if (isUpdate) {
    await db(table).where("id", obj.id).update(obj);
  } else {
    await db(table).insert(obj);
  }

  return await fetch(obj.id);
}

module.exports = {
  setDbConnection,
  fetch,
  fetchAll,
  fetchByWorkflow,
  save
};
