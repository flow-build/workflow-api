const captureActorData = async (ctx, next) => {
  if (!ctx.state.user) {
    ctx.throw(401, "User data not found");
  }
  const actor_id = ctx.state.user.actor_id;
  if (!actor_id) {
    ctx.throw(401, "Actor id not found");
  }

  const claims = ctx.state.user.claims;
  if (!Array.isArray(claims)) {
    ctx.throw(401, "Invalid claims");
  }

  if (ctx.state.actor_data) {
    ctx.state.actor_data["actor_id"] = actor_id,
    ctx.state.actor_data["claims"] = claims;
  } else {
    ctx.state.actor_data = {actor_id: actor_id,
                            claims: claims};
  }

  return await next();
};

const validateUUID = async (ctx, next) => {
  const id = ctx.params.id || ctx.request.query.workflow_id;
  if (id) {
    const is_valid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    if (!is_valid) {
      ctx.throw(404, "Invalid id");
    } else {
      return await next();
    }
  } else {
    return await next();
  }
}

module.exports = {
  captureActorData,
  validateUUID
};
