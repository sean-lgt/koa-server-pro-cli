import pino from 'pino'
import path from 'path'

const logDir = path.join(process.cwd(), 'logs')

/**
 * 获取东八区格式化时间: yyyy-mm-dd HH:MM:ss
 */
const getChinaTime = () => {
  const now = new Date()
  // 转换为东八区时间
  const offset = 8 * 60
  const chinaTime = new Date(now.getTime() + (now.getTimezoneOffset() + offset) * 60000)

  const date = chinaTime.toISOString().split('T')[0] // yyyy-mm-dd
  const time = chinaTime.toTimeString().split(' ')[0] // HH:MM:ss

  return `,"time":"${date} ${time}"`
}

const transport = pino.transport({
  targets: [
    // 1. 控制台：实时调试
    {
      target: 'pino-pretty',
      level: 'trace', // 改为 trace 确保所有级别都能通过
      options: {
        colorize: true,
        // 这里强制控制台也显示相同的格式
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname,label',
      },
    },
    // 2. 文件：持久化存储
    {
      target: 'pino-roll',
      level: 'trace', // 改为 trace 确保所有级别都能通过
      options: {
        file: path.join(logDir, 'log_'),
        dateFormat: 'yyyyMMdd', // 文件名中的日期格式
        extension: '.log',
        frequency: 'daily', // 每天切割一次
        size: '10m', // 或者单文件超过 10M 也切割
        mkdir: true,
        limit: {
          count: 15,
        },
      },
    },
  ],
})

// 创建全局 logger 实例
const logger = pino(
  {
    // 重写 JSON 日志中的 time 字段格式
    timestamp: getChinaTime,
    // 移除默认的 Unix 时间戳，确保只显示我们自定义的格式
    base: null,
    // 方案：使用 mixin 动态注入一个 label 字段
    // 这样做最安全，绝不会导致日志流中断
    mixin(_context, level) {
      const levelMap = {
        10: 'TRACE',
        20: 'DEBUG',
        30: 'INFO',
        40: 'WARN',
        50: 'ERROR',
        60: 'FATAL',
      }
      return { label: levelMap[level] || 'USER' }
    },
    // 关键配置：格式化级别
    // formatters: {
    //   level: (label) => {
    //     // console.log('打印信息', label)
    //     return { level: label.toUpperCase() } // 将数字转为大写字符串
    //   },
    // },
    // // 2. 这里的 hooks 非常重要，确保级别被正确映射
    // hooks: {
    //   logMethod(inputArgs, method) {
    //     return method.apply(this, inputArgs)
    //   },
    // },
  },
  transport,
)

export default logger
