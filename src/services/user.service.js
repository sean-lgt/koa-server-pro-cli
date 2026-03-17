import { prisma } from '#/plugins/prisma.js'

export const findUserByEmail = (email) => prisma.user.findUnique({ where: { email } })

export const createUser = (data) => prisma.user.create({ data })

export const getAllStudents = (data) => {
  return prisma.student.findMany({})
}
