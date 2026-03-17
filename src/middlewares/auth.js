import jwt from 'jsonwebtoken'
import { BusinessCode } from '#/utils/response.js'

// 1. 核心解析逻辑：尝试从 Header 获取并解密用户信息
export const decodeToken = (ctx) => {
  const authHeader = ctx.header.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  const token = authHeader.split(' ')[1]
  try {
    // 假设你的 JWT_SECRET 存在环境变量中
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (err) {
    return null // Token 过期或伪造，返回 null
  }
}

/**
 * 【解析中间件】：全量接口可用
 * 无论是否传 Token，都尝试解析。解析成功则挂载到 ctx.state.user
 */
export const tokenParser = async (ctx, next) => {
  const user = decodeToken(ctx)
  if (user) {
    ctx.state.tokenUser = user // 将解密信息（如 { id: 1, role: 'admin' }）存入 state
  }
  await next()
}

/**
 * 【强制拦截中间件】：仅限需要登录的接口
 * 配合 tokenParser 使用，如果没有用户信息则直接中断并返回 401
 */
export const loginGuard = async (ctx, next) => {
  if (!ctx.state.user) {
    return ctx.fail(BusinessCode.AUTH_ERROR, '请先登录后访问')
  }
  await next()
}
