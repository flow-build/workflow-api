const { getCockpit } = require("../engine");
const { logger } = require("../utils/logger");

const savePackage = async (ctx, next) => {
  logger.debug("called savePackage");
  const cockpit = getCockpit();
  const input_package = ctx.request.body;
  try {
    const package_ = await cockpit.savePackage(
      input_package.name,
      input_package.description,
      input_package.code
    );
    ctx.status = 201;
    ctx.body = {
      package_id: package_.id,
      package_url: `${ctx.header.host}${ctx.url}/${package_.id}`,
    };
  } catch (err) {
    ctx.status = 400;
    ctx.body = { error: err };
  }

  return next();
};

const fetchPackage = async (ctx, next) => {
  logger.debug("called fetchPackage");
  const cockpit = getCockpit();
  const package_id = ctx.params.id;
  const package_ = await cockpit.fetchPackage(package_id);
  if (package_) {
    ctx.status = 200;
    ctx.body = package_.serialize();
  } else {
    ctx.status = 404;
  }

  return next();
};

const deletePackage = async (ctx, next) => {
  logger.debug("called deletePackage");
  const cockpit = getCockpit();
  const package_id = ctx.params.id;
  const num_deleted = await cockpit.deletePackage(package_id);
  if (num_deleted == 0) {
    ctx.status = 404;
  } else {
    ctx.status = 202;
    ctx.body = {
      deleted: num_deleted
    }
  }

  return next();
};

module.exports = {
  savePackage,
  fetchPackage,
  deletePackage,
};
