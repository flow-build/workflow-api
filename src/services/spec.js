let db;

function setDbConnection(dbConnection) {
  db = dbConnection;
}

const table = "node_spec"

async function fetch(id) {
  let result;

  result = await db(table).where("id", id).first();

  return result;
}

async function fetchByName(name) {
  let result;

  result = await db(table).where("spec_name", name);

  return result;
}

async function fetchByType(type) {
  let result;

  result = await db(table).where("node_type", type);

  return result;
}

async function save(obj) {
  const isUpdate = obj.id && (await fetch(obj.id));
  if (isUpdate) {
    await db(table).where("id", obj_id).update(obj);
  } else {
    await db(table).insert(obj);
  }

  return await fetch(obj.id);
}

module.exports = {
  setDbConnection,
  fetch,
  fetchByName,
  fetchByType,
  save
};
