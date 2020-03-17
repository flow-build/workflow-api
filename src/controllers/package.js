const { getCockpit } = require("../engine");

const savePackage = async (ctx, next) => {
  const cockpit = getCockpit();
  const input_package = ctx.request.body;
  try{
    const package_ = await cockpit.savePackage(input_package.name,
                                              input_package.description,
                                              input_package.code);
    ctx.status = 201;
    ctx.body = {
      package_id: package_.id,
      package_url: `${ctx.header.host}${ctx.url}/${package_.id}`
    };
  } catch(err) {
    ctx.status = 400;
    ctx.body = {error: err};
  }
};

const fetchPackage = async (ctx, next) => {
  const cockpit = getCockpit();
  const package_id = ctx.params.id;
  const package_ = await cockpit.fetchPackage(package_id);
  if (package_) {
    ctx.status = 200;
    ctx.body = package_.serialize();
  }
  else {
    ctx.status = 404;
  }
};

const deletePackage = async (ctx, next) => {
  const cockpit = getCockpit();
  const package_id = ctx.params.id;
  const num_deleted = await cockpit.deletePackage(package_id);
  if (num_deleted == 0) {
    ctx.status = 404;
  }
  else {
    ctx.status = 204;
  }
};

module.exports = {
  savePackage,
  fetchPackage,
  deletePackage
};
