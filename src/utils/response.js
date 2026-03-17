/**
 * 统一响应结构格式化
 */
export const formatResponse = (code = 200, data = null, message = 'success') => {
  return {
    code,
    data,
    message,
  }
}

// 预定义常见业务错误码
export const BusinessCode = {
  SUCCESS: 200,
  PARAM_ERROR: 201, // 参数错误
  AUTH_ERROR: 401, // 鉴权失败
  NOT_FOUND: 202, // 资源不存在
  SERVER_ERROR: 500, // 服务器内部错误
  PRISMA_ERROR: 501, // prisma 报错
}
