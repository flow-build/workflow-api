const fs = require('fs')

const getSwagger = async (ctx, next) => {
  ctx.type = 'text/html; charset=utf-8',
  ctx.body = fs.createReadStream('public/swagger-ui/index.html')

  return next()
}

module.exports = {
  getSwagger
}