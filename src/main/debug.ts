import debug from "debug"
import { app } from "electron"
import path from "node:path"
import logger from "logger/main"
import * as rfs from "rotating-file-stream"
import fs from "fs"

// 配置根目录
const logsPath = app.getPath("logs")
logger.debug(`日志地址：${logsPath}`)

const LOG_ROOT = path.join(logsPath)

// 缓存当前应用启动的日志文件流
let currentLogStream: rfs.RotatingFileStream | null = null

// 生成当前启动时的日志文件名
const getLogFileName = () => {
  const now = new Date()
  const timestamp = now.toISOString().replace(/[:.]/g, "-")
  return `app-${timestamp}.log`
}

// 覆盖 debug.log 方法
const originalLog = debug.log
debug.log = function (...args) {
  // 保留原始控制台输出
  originalLog.apply(this, args)

  // 确保日志目录存在
  if (!fs.existsSync(LOG_ROOT)) {
    fs.mkdirSync(LOG_ROOT, { recursive: true })
  }

  // 延迟初始化日志流，直到第一次写入
  if (!currentLogStream) {
    const logFileName = getLogFileName()
    currentLogStream = rfs.createStream(logFileName, {
      path: LOG_ROOT,
      size: "10M", // 单个文件最大 10MB
      rotate: 10, // 保留最近 10 个文件
    })
  }

  // @ts-ignore   获取当前命名空间
  const namespace = this.namespace || "unknown"

  // 写入日志（添加时间戳和命名空间）
  const timestamp = new Date().toISOString()
  const message = args.join(" ")
  currentLogStream.write(`[${timestamp}] [${namespace}] ${message}\n`)
}

app.on("before-quit", () => {
  if (currentLogStream) {
    currentLogStream.end()
    currentLogStream.destroy()
    currentLogStream = null
  }
})
