import cors from 'koa2-cors'

export const corsHandler = cors({
  // 1. 允许的源
  origin: (ctx) => {
    // 开发环境下允许所有源
    if (process.env.NODE_ENV === 'development') {
      return '*'
    }
    return '*'
    // // 生产环境下建议配置具体的白名单域名
    // const whiteList = ['https://yourdomain.com', 'https://admin.yourdomain.com']
    // const origin = ctx.get('Origin')
    // if (whiteList.includes(origin)) {
    //   return origin
    // }
    // return false // 不在白名单内的拒绝跨域
  },

  // 2. 允许的请求方法
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

  // 3. 允许的请求头
  allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],

  // 4. 是否允许携带 Cookie
  credentials: true,

  // 5. 预检请求（OPTIONS）的有效期（秒），避免频繁发送预检请求
  maxAge: 3600,
})
