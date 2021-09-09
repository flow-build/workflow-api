const setPersist = (persist) => {
  return async (ctx, next) => {
    ctx.state.persist = persist;
    return await next();
  };
};

module.exports = {
  setPersist,
};
