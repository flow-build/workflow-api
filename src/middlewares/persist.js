const setPersist = (persist) => {
  return async (ctx, next) => {
    ctx.state.persist = persist;
    return next();
  };
};

module.exports = {
  setPersist,
};
