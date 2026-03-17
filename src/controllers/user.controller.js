import jwt from 'jsonwebtoken'
import { createUserSchema, loginSchema } from '#/schemas/user.schema.js'
import { findUserByEmail, createUser, getAllStudents } from '#/services/user.service.js'
import logger from '#/plugins/logger.js'

export const register = async (ctx) => {
  const data = createUserSchema.parse(ctx.request.body)
  const user = await createUser(data)
  ctx.success({ id: user.id, email: user.email })
}

export const login = async (ctx) => {
  const { email, password } = loginSchema.parse(ctx.request.body)
  const user = await findUserByEmail(email)
  if (!user || user.password !== password) {
    ctx.throw(401, 'Invalid credentials')
  }
  const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })
  ctx.success({ token })
}

export const test = async (ctx) => {
  ctx.success({ test: 'suceesss' })
}

// 获取所有的学生数据
export const getAllStudentList = async (ctx) => {
  const studentList = await getAllStudents()
  logger.info({
    msg: '获取到的学生列表',
    data: studentList,
  })

  ctx.success({
    list: studentList,
  })
  // ctx.fail(201, '发生错误信息')
  // throw Error('系统异常')
}
