import logger from '#/plugins/logger.js'
import { getStudentList, createStudent, updateStudent, deleteById, getClassDetail } from '#/services/student.service.js'
import { BusinessCode } from '#/utils/response.js'

/**
 * 获取学生列表信息
 */
export const getList = async (ctx) => {
  // 获取查询参数
  const queryParams = ctx.query
  const { list, total, totalPages } = await getStudentList(queryParams.page || 1, queryParams.limit || 10)
  ctx.success({ list, total, totalPages })
}

/**
 * 新建学生
 */
export const create = async (ctx) => {
  // 获取body中的数据
  const bodyParams = ctx.request.body
  const addRes = await createStudent(bodyParams)

  ctx.success({ ...addRes })
}

/**
 * 编辑学生信息
 */
export const edit = async (ctx) => {
  const updateId = ctx.query.id || null
  if (!updateId) {
    ctx.fail(BusinessCode.PARAM_ERROR, '缺少必要参数')
    return false
  }
  const bodyParams = ctx.request.body
  const editRes = await updateStudent(Number(updateId), bodyParams)
  ctx.success({ ...editRes })
}

/**
 * 删除学生
 */
export const deleteStudent = async (ctx) => {
  const deleteId = ctx.query.id || null
  if (!deleteId) {
    ctx.fail(BusinessCode.PARAM_ERROR, '缺少必要参数')
    return false
  }
  const delRes = await deleteById(deleteId)
  ctx.success(null, '操作成功')
}

/**
 * 查询所在班级的学生信息和教师信息
 */
export const getClassInfoById = async (ctx) => {
  logger.info('查询所在班级的学生信息和教师信息')
  const queryId = Number(ctx.query.id || 0)
  if (!queryId) {
    ctx.fail(BusinessCode.PARAM_ERROR, '缺少必要参数')
    return false
  }
  const classInfo = await getClassDetail(queryId)
  logger.info(`信息数据：${JSON.stringify(classInfo)}`)

  if (!classInfo) {
    ctx.fail(BusinessCode.PARAM_ERROR, '班级信息不存在，请检查')
    return false
  }

  ctx.success({ ...classInfo })
}
