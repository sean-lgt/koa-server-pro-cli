import Router from '@koa/router'
import { getList, create, edit, deleteStudent, getClassInfoById } from '#/controllers/student.controller.js'

const router = new Router({ prefix: '/api/student' })

// 获取所有学生信息
router.get('/list', getList)
// 新建学生
router.post('/create', create)
// 编辑学生
router.post('/edit', edit)
// 删除学生
router.delete('/delete', deleteStudent)
// 查询班级信息
router.get('/classInfo', getClassInfoById)

export default router
