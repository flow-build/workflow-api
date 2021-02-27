const healthCheck = (ctx, next) => {
    console.log("[KW] Called healthCheck");
    ctx.status = 200;
    ctx.body = 'Koa Workflow is ok!'
};

module.exports = {
    healthCheck
}