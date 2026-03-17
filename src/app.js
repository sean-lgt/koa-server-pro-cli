import 'dotenv/config'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'

import { responseHandler } from './middlewares/response.js'
import { tokenParser } from './middlewares/auth.js'
import { corsHandler } from './middlewares/cors.js'

import userRouter from './routes/user.route.js'

import logger from './plugins/logger.js'
import { registerSwagger } from './plugins/swagger.js'

const app = new Koa()

if (process.env.SWAGGER_ENABLE === 'true') {
  // app.use(swaggerHandler)
  registerSwagger(app)
  console.log('✅ Swagger 文档已启用: http://localhost:3000/docs')
}

// 中间件注册顺序很重要
app.use(corsHandler)
app.use(responseHandler)
app.use(bodyParser())
app.use(tokenParser)

// 路由注册
app.use(userRouter.routes()).use(userRouter.allowedMethods())

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

export default app
