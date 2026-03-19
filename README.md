# koa-server-pro-cli

基于 **Koa** 构建的 Node.js 后端服务脚手架，集成了 Prisma ORM、JWT 鉴权、Swagger 文档、结构化日志等常用能力，适合中小型 RESTful API 项目快速落地。

---

## 目录

- [项目简介](#项目简介)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [环境变量](#环境变量)
- [部署](#部署)
- [项目结构](#项目结构)
- [核心模块说明](#核心模块说明)
- [API 文档](#api-文档)
- [数据库](#数据库)
- [路径别名](#路径别名)
- [开发配置说明](#开发配置说明)

---

## 项目简介

本项目是一个基础的后端服务快速启动框架，提供用户注册/登录、学生 CRUD、班级查询等DEMO接口。采用分层架构（路由 → 控制器 → 服务 → 数据库），职责清晰，易于扩展。

---

## 技术栈

| 类别     | 技术                                      |
| -------- | ----------------------------------------- |
| 运行时   | Node.js (ESM)                             |
| Web 框架 | Koa 3                                     |
| ORM      | Prisma 7 + MariaDB Adapter                |
| 数据库   | MySQL / MariaDB                           |
| 鉴权     | JWT (jsonwebtoken + koa-jwt)              |
| 参数校验 | Zod                                       |
| 日志     | Pino + pino-roll                          |
| API 文档 | Swagger (swagger-jsdoc + koa2-swagger-ui) |
| 跨域     | koa2-cors                                 |
| 开发工具 | tsx + nodemon                             |
| 进程管理 | PM2                                       |

---

## 快速开始

### 前置条件

- Node.js >= 18
- MySQL / MariaDB 数据库

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env` 文件并填写配置（详见[环境变量](#环境变量)章节）。

### 初始化数据库

```bash
# 生成 Prisma Client
npm run db:generate

# 执行数据库迁移
npm run db:migrate
```

### 启动开发服务

```bash
npm run dev
```

服务默认运行在 `http://localhost:3000`

---

## 环境变量

在项目根目录的 `.env` 文件中配置以下变量：

```env
# 服务端口
PORT=3000

# 运行环境
NODE_ENV=development

# 数据库连接（Prisma Adapter 使用以下分项配置）
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=your_database

# Prisma CLI 迁移时使用（DATABASE_URL 格式）
DATABASE_URL="mysql://root:your_password@127.0.0.1:3306/your_database"

# JWT 密钥（生产环境请替换为足够复杂的随机字符串）
JWT_SECRET=your_jwt_secret

# 是否启用 Swagger 文档（生产环境建议设为 false）
SWAGGER_ENABLE=true
```

---

## 部署

### 开发环境

```bash
npm run dev          # nodemon 热重载，自动监听文件变化
npm run dev:watch    # tsx watch 模式
```

### 生产环境（PM2）

```bash
# 启动服务
npm run prod

# 查看运行状态
npm run prod:status

# 查看日志
npm run prod:logs

# 重启 / 热重载（零停机）
npm run prod:restart
npm run prod:reload

# 停止服务
npm run prod:stop
```

> PM2 文档：https://pm2.keymetrics.io/docs/usage/quick-start/

---

## 项目结构

```
src/
├── app.js                  # 应用入口，注册中间件和路由
├── controllers/            # 控制器层：处理请求、调用 Service、返回响应
│   ├── user.controller.js
│   └── student.controller.js
├── services/               # 服务层：封装业务逻辑和数据库操作
│   ├── user.service.js
│   └── student.service.js
├── routes/                 # 路由层：定义 URL 路径与控制器的映射
│   ├── user.route.js
│   └── student.route.js
├── middlewares/            # 中间件：跨切面逻辑（鉴权、响应格式化、跨域）
│   ├── auth.js
│   ├── cors.js
│   └── response.js
├── plugins/                # 插件：第三方服务的初始化与封装
│   ├── prisma.js           # Prisma Client 单例
│   ├── logger.js           # Pino 日志实例
│   └── swagger.js          # Swagger 文档注册
├── schemas/                # 参数校验 Schema（Zod）
│   └── user.schema.js
└── utils/                  # 工具函数
    └── response.js         # 统一响应格式 & 业务错误码
```

### 数据流向

```
HTTP 请求
  → 中间件（cors → responseHandler → bodyParser → tokenParser）
  → 路由（routes/）
  → 控制器（controllers/）  ← Zod 参数校验（schemas/）
  → 服务层（services/）
  → Prisma ORM（plugins/prisma.js）
  → 数据库
```

---

## 核心模块说明

### 中间件（middlewares/）

**response.js** — 统一响应与全局异常捕获

在 `ctx` 上挂载 `ctx.success()` 和 `ctx.fail()` 两个辅助方法，所有接口统一返回 HTTP 200，通过 `code` 字段区分业务状态。同时捕获所有未处理异常，防止服务崩溃。

```js
// 成功响应
ctx.success({ list: [] })
// => { code: 200, data: { list: [] }, message: 'success' }

// 业务失败
ctx.fail(201, '参数错误')
// => { code: 201, data: null, message: '参数错误' }
```

**auth.js** — JWT 鉴权

- `tokenParser`：全局解析 Token，解析成功后将用户信息挂载到 `ctx.state.tokenUser`，不强制拦截
- `loginGuard`：路由级守卫，未登录时直接返回 401，按需挂载到需要保护的路由上

```js
// 路由中按需使用
router.get('/profile', loginGuard, getProfile)
```

**cors.js** — 跨域配置

基于 `koa2-cors` 封装，开发环境允许所有来源，生产环境可在 `whiteList` 中配置域名白名单。

> koa2-cors 文档：https://github.com/zadzbw/koa2-cors

### 插件（plugins/）

**prisma.js** — 数据库连接

使用 `@prisma/adapter-mariadb` 驱动连接 MariaDB/MySQL，导出全局单例 `prisma`，在 Service 层直接引入使用。

```js
import { prisma } from '#/plugins/prisma.js'
const user = await prisma.user.findUnique({ where: { email } })
```

> Prisma 文档：https://www.prisma.io/docs

**logger.js** — 结构化日志

基于 `pino` 构建，同时输出到控制台（彩色格式化）和本地文件（按天切割，保留 15 天）。日志文件存放在 `logs/` 目录。

```js
import logger from '#/plugins/logger.js'

logger.info({ msg: '操作成功', userId: 1 })
logger.warn({ url: ctx.url }, '业务警告')
logger.error({ stack: err.stack }, '运行时异常')
```

> Pino 文档：https://getpino.io  
> pino-roll 文档：https://github.com/mcollina/pino-roll

**swagger.js** — API 文档

扫描 `src/routes/` 和 `src/controllers/` 中的 JSDoc 注释自动生成 OpenAPI 3.0 文档。通过 `SWAGGER_ENABLE=true` 环境变量控制是否启用。

访问地址：`http://localhost:3000/docs`

```js
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 用户登录
 */
router.post('/login', login)
```

> swagger-jsdoc 文档：https://github.com/Surnet/swagger-jsdoc  
> koa2-swagger-ui 文档：https://github.com/scttcper/koa2-swagger-ui

### 参数校验（schemas/）

使用 `zod` 定义请求体 Schema，在控制器中调用 `.parse()` 校验，校验失败会自动抛出异常并被全局错误处理捕获。

```js
import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

// 控制器中使用
const data = createUserSchema.parse(ctx.request.body)
```

> Zod 文档：https://zod.dev

### 工具（utils/）

**response.js** — 统一响应格式与业务错误码

```js
export const BusinessCode = {
  SUCCESS: 200,
  PARAM_ERROR: 201,
  AUTH_ERROR: 401,
  NOT_FOUND: 202,
  SERVER_ERROR: 500,
  PRISMA_ERROR: 501,
}
```

---

## API 文档

启用 Swagger 后访问 `http://localhost:3000/docs` 查看完整接口文档。

### 参考接口

| 方法   | 路径                   | 说明                     | 是否需要登录 |
| ------ | ---------------------- | ------------------------ | ------------ |
| POST   | /api/auth/register     | 用户注册                 | 否           |
| POST   | /api/auth/login        | 用户登录，返回 JWT Token | 否           |
| GET    | /api/auth/test         | 鉴权测试                 | 是           |
| GET    | /api/student/list      | 获取学生列表（分页）     | 否           |
| POST   | /api/student/create    | 新建学生                 | 否           |
| POST   | /api/student/edit      | 编辑学生信息             | 否           |
| DELETE | /api/student/delete    | 删除学生                 | 否           |
| GET    | /api/student/classInfo | 查询班级详情（含教师）   | 否           |

### 分页参数

`GET /api/student/list` 支持以下 Query 参数：

| 参数    | 类型   | 默认值 | 说明     |
| ------- | ------ | ------ | -------- |
| `page`  | number | 1      | 当前页码 |
| `limit` | number | 10     | 每页条数 |

响应示例：

```json
{
  "code": 200,
  "data": {
    "list": [...],
    "total": 100,
    "totalPages": 10
  },
  "message": "success"
}
```

### 鉴权方式

登录成功后获取 Token，在请求头中携带：

```
Authorization: Bearer <token>
```

---

## 数据库

### 数据模型

- `Class` — 班级
- `Student` — 学生（关联班级）
- `Teacher` — 教师
- `Subject` — 科目
- `TeacherSubject` — 教师与科目的多对多关系
- `TeacherClass` — 教师与班级的多对多关系

### 常用命令

```bash
# 生成 Prisma Client（修改 schema 后执行）
npm run db:generate

# 创建并执行迁移
npm run db:migrate

# 打开 Prisma Studio 可视化管理数据
npm run db:studio
```

> 初始化 SQL 脚本位于 `prisma/init.sql`

### 两种初始化方式

**方式一：使用 Prisma Migrate（推荐）**

适合开发阶段，Prisma 自动根据 `schema.prisma` 生成并执行迁移文件：

```bash
npm run db:migrate
```

**方式二：直接执行 SQL 脚本**

适合生产环境或已有数据库的场景，脚本包含建库、建表和示例数据：

```bash
mysql -u root -p < prisma/init.sql
```

> 两种方式二选一，不要混用，避免迁移历史冲突。

---

## 路径别名

项目通过 `package.json` 的 `imports` 字段配置了 `#/` 路径别名，指向 `src/` 目录，避免深层相对路径引用。

```json
// package.json
"imports": {
  "#/*": "./src/*"
}
```

编辑器智能提示由 `jsconfig.json` 提供支持：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "#/*": ["./src/*"] }
  }
}
```

使用示例：

```js
// 等价于 ../../plugins/logger.js
import logger from '#/plugins/logger.js'
```

---

## 开发配置说明

### nodemon.json

热重载配置，监听 `src/` 目录下 `.js` 和 `.json` 文件的变化：

```json
{
  "watch": ["src"],
  "ext": "js,json",
  "exec": "node src/app.js"
}
```

> 实际开发中 `npm run dev` 使用 `tsx` 执行，支持 TypeScript 类型和 ESM，nodemon 配置作为备用参考。

### tsconfig.json

项目以 JavaScript 为主，`tsconfig.json` 主要用于编辑器类型推断和 Prisma CLI 的 TypeScript 支持（`prisma.config.ts`），不参与实际构建流程。关键配置：

- `allowJs: true` — 允许 `.js` 文件纳入分析
- `checkJs: false` — JS 文件不做强制类型检查
- `paths` — 配合 `#/` 别名提供编辑器跳转支持
