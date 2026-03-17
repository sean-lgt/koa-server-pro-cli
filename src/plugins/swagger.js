import fs from 'fs'
import path from 'path'
import swaggerJSDoc from 'swagger-jsdoc'
import { koaSwagger } from 'koa2-swagger-ui'
import logger from '#/plugins/logger.js'

// Swagger 定义
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API',
    version: '1.0.0',
    description: '接口文档',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: '本地开发环境',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
}

const options = {
  swaggerDefinition,
  // 扫描控制层（Controller）中的注释
  // apis: ['./src/routes*.js'],
  apis: [path.join(process.cwd(), 'src/routes/*.js'), path.join(process.cwd(), 'src/controllers/*.js')],
}

// 生成文档JSON数据
const swaggerSpec = swaggerJSDoc(options)

/** 注册SwaggerUI */
export const registerSwagger = (app) => {
  app.use(
    koaSwagger({
      routePrefix: '/docs', // 访问地址：http://localhost:3000/docs
      swaggerOptions: {
        spec: swaggerSpec, // 直接注入解析后的对象
      },
    }),
  )
}
