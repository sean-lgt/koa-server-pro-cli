import logger from '#/plugins/logger.js'
import { formatResponse, BusinessCode } from '#/utils/response.js'

export const responseHandler = async (ctx, next) => {
  // 1. 挂载成功辅助函数
  ctx.success = (data = null, message = 'success') => {
    ctx.status = 200 // 强制 HTTP 200
    ctx.body = formatResponse(BusinessCode.SUCCESS, data, message)
  }

  // 2. 挂载失败辅助函数 (用于手动返回逻辑错误)
  ctx.fail = (code, message, data = null) => {
    ctx.status = 200 // 强制 HTTP 200
    ctx.body = formatResponse(code, data, message)
    // 联动日志：业务警告不需要堆栈信息，只需记录请求详情
    logger.warn(
      {
        url: ctx.url,
        payload: ctx.request.body,
        user: ctx.state.tokenUser?.id,
      },
      `[Business Warn] [code ${code}] ${message}`,
    )
  }

  try {
    await next()
  } catch (err) {
    // 3. 全局异常拦截
    const code = err.code || BusinessCode.SERVER_ERROR
    const message = err.message || 'Internal Server Error'

    // 联动日志：记录完整的错误堆栈，方便定位代码崩溃位置
    logger.error(
      {
        url: ctx.url,
        method: ctx.method,
        query: ctx.query,
        body: ctx.request.body,
        user: ctx.state.tokenUser?.id,
        stack: err.stack, // 核心：记录堆栈
      },
      `[Runtime Error] ${err.message}`,
    )

    ctx.status = 200 // 即使程序崩溃，对外依然返回 HTTP 200
    ctx.body = formatResponse(code, null, message)
  }
}
