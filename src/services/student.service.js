import { prisma } from '#/plugins/prisma.js'

/**
 * 获取学生列表（分页）
 * @param {number} page  - 当前页码（从 1 开始）
 * @param {number} limit - 每页条数
 * @returns {Promise<{ list: Array, total: number, totalPages: number }>}
 */
export const getStudentList = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit

  const [list, total] = await prisma.$transaction([
    prisma.student.findMany({
      skip,
      take: Number(limit),
      // include: { class: true },
    }),
    prisma.student.count(),
  ])

  return {
    list,
    total,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * 创建学生
 * @param {Object} data - 学生数据
 * @returns {Promise<Object>}
 */
export const createStudent = async (data) => {
  const student = await prisma.student.create({
    data,
  })

  return student
}

/**
 * 更新学生
 * @param {number} id - 学生ID
 * @param {Object} data - 要更新的学生数据
 * @returns {Promise<Object>}
 */
export const updateStudent = async (id, data) => {
  const student = await prisma.student.update({
    where: { id },
    data,
  })

  return student
}

/**
 * 删除学生
 * @param {number} id - 学生ID
 * @returns {Promise<Object>}
 */
export const deleteById = async (id) => {
  console.log('获取到的id', id)
  const student = await prisma.student.delete({
    where: { id: Number(id) },
  })

  return student
}

/**
 * 根据班级 ID 获取该班学生和教师信息
 * @param {number} classId - 班级 ID
 * @returns {Promise<{ students: Array, teachers: Array } | null>}
 */
export const getClassDetail = async (classId) => {
  const result = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      students: true,
      // Prisma 自动通过 TeacherClass 中间表 JOIN，直接拿到 Teacher 数据
      teachers: {
        include: {
          teacher: {
            include: {
              // 通过 TeacherSubject 中间表展开该教师所任职的科目
              subjects: {
                include: { subject: true },
              },
            },
          },
        },
      },
    },
  })

  if (!result) return null

  return {
    id: result.id,
    name: result.name,
    students: result.students,
    teachers: result.teachers.map(({ teacher }) => ({
      ...teacher,
      subjects: teacher.subjects.map((s) => s.subject.name),
    })),
  }
}
