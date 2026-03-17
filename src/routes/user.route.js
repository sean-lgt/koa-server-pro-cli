import Router from '@koa/router'
import { loginGuard } from '#/middlewares/auth.js'
import { register, login, test, getAllStudentList } from '#/controllers/user.controller.js'

const router = new Router({ prefix: '/api/auth' })

/**
 * @swagger
 * /api/auth/register:
 *  post:
 *    description: 获取单个用户接口
 *    summary: 注册用户信息
 */
router.post('/register', register)
router.post('/login', login)
router.get('/test', loginGuard, test)
router.get('/getAllStudents', getAllStudentList)

export default router
